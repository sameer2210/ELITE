import mongoose from "mongoose";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/Aws.js";

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const parsePositiveInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (req) => {
  const start = parsePositiveInt(req.query._start);
  const limit = parsePositiveInt(req.query._limit);

  if (start !== null || limit !== null) {
    return { skip: start || 0, limit: limit || 0 };
  }

  const page = parsePositiveInt(req.query.page);
  const pageLimit = parsePositiveInt(req.query.limit);
  if (pageLimit !== null) {
    const safePage = page && page > 0 ? page : 1;
    return { skip: (safePage - 1) * pageLimit, limit: pageLimit };
  }

  return { skip: 0, limit: 0 };
};

const parseCommaList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildFilters = (query, allowedFields = []) => {
  const filters = {};
  for (const field of allowedFields) {
    const raw = query[field];
    if (raw === undefined) continue;
    if (typeof raw === "string" && raw.includes(",")) {
      filters[field] = { $in: parseCommaList(raw) };
    } else {
      filters[field] = raw;
    }
  }
  return filters;
};

const buildSearchFilter = (searchTerm, searchFields = []) => {
  if (!searchTerm || !searchFields.length) return null;
  const regex = new RegExp(escapeRegExp(searchTerm), "i");
  return {
    $or: searchFields.map((field) => ({ [field]: regex })),
  };
};

const getPopulatePaths = (req, allowedPopulate = [], defaultPopulate = []) => {
  const raw = req.query.populate;
  const requested = typeof raw === "string" ? parseCommaList(raw) : [];
  return [...new Set([
    ...defaultPopulate,
    ...requested.filter((path) => allowedPopulate.includes(path)),
  ])];
};

const applyPopulate = (query, req, allowedPopulate = [], defaultPopulate = []) => {
  const populatePaths = getPopulatePaths(req, allowedPopulate, defaultPopulate);
  for (const path of populatePaths) {
    query = query.populate(path);
  }
  return query;
};

const getFieldTypeForFilter = (Model, field) => {
  const schemaPath = Model?.schema?.path(field);
  if (!schemaPath) return null;

  if (schemaPath.instance !== "Array") {
    return schemaPath.instance;
  }

  const rawArrayType = Array.isArray(schemaPath.options?.type)
    ? schemaPath.options.type[0]
    : schemaPath.options?.type;
  const itemType = rawArrayType?.type || rawArrayType;

  if (itemType === mongoose.Schema.Types.ObjectId) return "ObjectId";
  if (itemType === Number) return "Number";
  if (itemType === Boolean) return "Boolean";
  if (itemType === Date) return "Date";
  if (itemType === String) return "String";
  return "Array";
};

const castFilterScalar = (value, fieldType) => {
  if (value === undefined || value === null) return value;

  switch (fieldType) {
    case "ObjectId":
      if (value instanceof mongoose.Types.ObjectId) return value;
      if (typeof value === "string" && OBJECT_ID_PATTERN.test(value)) {
        return new mongoose.Types.ObjectId(value);
      }
      return value;
    case "Number":
      if (typeof value === "number") return value;
      if (typeof value === "string" && value.trim() !== "") {
        const num = Number(value);
        if (Number.isFinite(num)) return num;
      }
      return value;
    case "Boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
      }
      return value;
    case "Date":
      if (value instanceof Date) return value;
      if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date;
      }
      return value;
    default:
      return value;
  }
};

const castFiltersForAggregation = (Model, filters = {}) => {
  const casted = {};

  for (const [field, rawValue] of Object.entries(filters)) {
    const fieldType = getFieldTypeForFilter(Model, field);

    if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
      const castedOperators = {};
      for (const [operator, operatorValue] of Object.entries(rawValue)) {
        if (Array.isArray(operatorValue)) {
          castedOperators[operator] = operatorValue.map((value) =>
            castFilterScalar(value, fieldType)
          );
        } else {
          castedOperators[operator] = castFilterScalar(operatorValue, fieldType);
        }
      }
      casted[field] = castedOperators;
      continue;
    }

    casted[field] = castFilterScalar(rawValue, fieldType);
  }

  return casted;
};

const buildSortObject = (sortValue, fallbackSort) => {
  const raw = typeof sortValue === "string" && sortValue.trim()
    ? sortValue
    : fallbackSort;

  const sort = {};
  const tokens = String(raw || "")
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith("-")) {
      const field = token.slice(1);
      if (field) sort[field] = -1;
      continue;
    }
    if (token.startsWith("+")) {
      const field = token.slice(1);
      if (field) sort[field] = 1;
      continue;
    }
    sort[token] = 1;
  }

  if (!Object.keys(sort).length) {
    sort.createdAt = -1;
  }

  return sort;
};

const isTextIndexMissingError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.codeName === "IndexNotFound" ||
    message.includes("text index required") ||
    message.includes("index not found for $text")
  );
};

const buildListPipeline = ({
  Model,
  filters,
  searchTerm,
  searchFields,
  sortValue,
  defaultSort,
  skip,
  limit,
  preferTextSearch,
}) => {
  const pipeline = [];
  const castedFilters = castFiltersForAggregation(Model, filters);

  if (Object.keys(castedFilters).length) {
    pipeline.push({ $match: castedFilters });
  }

  const trimmedSearch = (searchTerm || "").trim();
  const canUseTextSearch =
    Boolean(trimmedSearch) && Array.isArray(searchFields) && searchFields.length;
  const shouldUseTextSearch =
    canUseTextSearch && preferTextSearch && trimmedSearch.length >= 3;

  if (canUseTextSearch) {
    if (shouldUseTextSearch) {
      pipeline.push({ $match: { $text: { $search: trimmedSearch } } });
      pipeline.push({ $addFields: { _searchScore: { $meta: "textScore" } } });
    } else {
      const searchFilter = buildSearchFilter(trimmedSearch, searchFields);
      if (searchFilter) {
        pipeline.push({ $match: searchFilter });
      }
    }
  }

  const hasExplicitSort = typeof sortValue === "string" && sortValue.trim();
  let sortStage = buildSortObject(sortValue, defaultSort);
  if (shouldUseTextSearch && !hasExplicitSort) {
    sortStage = { _searchScore: -1, ...sortStage };
  }

  pipeline.push({ $sort: sortStage });

  if (skip) {
    pipeline.push({ $skip: skip });
  }
  if (limit) {
    pipeline.push({ $limit: limit });
  }

  pipeline.push({ $addFields: { id: { $toString: "$_id" } } });
  pipeline.push({ $project: { __v: 0, _searchScore: 0 } });

  return pipeline;
};

const pickAllowed = (payload, allowedFields) => {
  if (!Array.isArray(allowedFields) || !allowedFields.length) {
    return { ...payload };
  }
  const picked = {};
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      picked[field] = payload[field];
    }
  }
  return picked;
};

const isAdmin = (req) => req.user && req.user.role === "admin";

const deleteS3Object = async (key) => {
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket || !key) return;

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    console.error(`Failed to delete S3 object: ${key}`, error);
  }
};

const ensureOwner = (doc, req, ownerField) => {
  if (!ownerField || isAdmin(req)) return true;
  const ownerId = doc?.[ownerField]?.toString();
  const userId = req.user?._id?.toString();
  return ownerId && userId && ownerId === userId;
};

const assignOwner = (payload, req, ownerField, allowAdminOverride = true) => {
  if (!ownerField || !req.user) return payload;
  if (!isAdmin(req) || !allowAdminOverride) {
    return { ...payload, [ownerField]: req.user._id };
  }
  if (!payload[ownerField]) {
    return { ...payload, [ownerField]: req.user._id };
  }
  return payload;
};

const sanitizePayload = (payload, req, ownerField, allowedFields) => {
  const cleaned = pickAllowed(payload, allowedFields);
  if (ownerField && !isAdmin(req)) {
    delete cleaned[ownerField];
  }
  return cleaned;
};

export const buildCrudController = (
  Model,
  {
    resourceName = "Resource",
    searchFields = [],
    filterFields = [],
    defaultSort = "-createdAt",
    allowedPopulate = [],
    defaultPopulate = [],
    ownerField = null,
    assignOwnerOnCreate = false,
    allowAdminOverride = true,
    allowedFields = null,
    scopeToUser = false,
  } = {}
) => {
  const list = async (req, res, next) => {
    try {
      const { skip, limit } = getPagination(req);
      const filters = buildFilters(req.query, filterFields);
      if (scopeToUser && ownerField && req.user && !isAdmin(req)) {
        filters[ownerField] = req.user._id;
      }

      const searchTerm = (req.query.q || req.query.search || "").trim();
      const populatePaths = getPopulatePaths(
        req,
        allowedPopulate,
        defaultPopulate
      );

      const runListAggregation = async (preferTextSearch) => {
        const pipeline = buildListPipeline({
          Model,
          filters,
          searchTerm,
          searchFields,
          sortValue: req.query.sort,
          defaultSort,
          skip,
          limit,
          preferTextSearch,
        });

        let docs = await Model.aggregate(pipeline).exec();
        if (populatePaths.length) {
          docs = await Model.populate(docs, populatePaths);
        }
        return docs;
      };

      let docs;
      try {
        docs = await runListAggregation(true);
        if (searchTerm && searchFields.length && !docs.length) {
          docs = await runListAggregation(false);
        }
      } catch (error) {
        if (searchTerm && searchFields.length && isTextIndexMissingError(error)) {
          docs = await runListAggregation(false);
        } else {
          throw error;
        }
      }

      res.json(docs);
    } catch (error) {
      next(error);
    }
  };

  const getById = async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id);
      query = applyPopulate(query, req, allowedPopulate, defaultPopulate);
      const doc = await query.exec();
      if (!doc) {
        res.status(404);
        throw new Error(`${resourceName} not found`);
      }
      res.json(doc);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      let payload = sanitizePayload(req.body || {}, req, ownerField, allowedFields);

      if (assignOwnerOnCreate) {
        payload = assignOwner(payload, req, ownerField, allowAdminOverride);
      }

      if (req.file) {
        const uploadedUrl = req.file.location;
        payload.image = uploadedUrl;
        payload.images = [uploadedUrl];
        payload.imageKey = req.file.key;
      }

      const created = await Model.create(payload);

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };
  
  const update = async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        res.status(404);
        throw new Error(`${resourceName} not found`);
      }
      if (!ensureOwner(doc, req, ownerField)) {
        res.status(403);
        throw new Error("Not authorized to update this resource");
      }
      const updates = sanitizePayload(req.body || {}, req, ownerField, allowedFields);
      let previousImageKey = null;

      if (req.file) {
        previousImageKey = doc.imageKey || null;
        const uploadedUrl = req.file.location;
        updates.image = uploadedUrl;
        updates.images = [uploadedUrl];
        updates.imageKey = req.file.key;
      }

      Object.assign(doc, updates);
      const updated = await doc.save();

      if (req.file && previousImageKey && previousImageKey !== updated.imageKey) {
        await deleteS3Object(previousImageKey);
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        res.status(404);
        throw new Error(`${resourceName} not found`);
      }
      if (!ensureOwner(doc, req, ownerField)) {
        res.status(403);
        throw new Error("Not authorized to delete this resource");
      }

      const imageKeyToDelete = doc.imageKey || null;
      await doc.deleteOne();

      if (imageKeyToDelete) {
        await deleteS3Object(imageKeyToDelete);
      }

      res.json({ message: `${resourceName} deleted`, id: req.params.id });
    } catch (error) {
      next(error);
    }
  };

  return { list, getById, create, update, remove };
};

export {
  applyPopulate,
  buildFilters,
  buildSearchFilter,
  escapeRegExp,
  getPagination,
  parsePositiveInt,
};
