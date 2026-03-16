import { useQuery } from "@tanstack/react-query";
import { http } from "./config";

const normalizeArrayParam = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean).join(",");
  return value;
};

const buildParams = ({
  search,
  page,
  limit,
  start,
  populate,
  filters,
  sort,
} = {}) => {
  const params = {};
  if (search) params.q = search;
  if (typeof start === "number") params._start = start;
  if (typeof limit === "number") params._limit = limit;
  if (typeof page === "number") params.page = page;
  if (sort) params.sort = sort;

  const populateValue = normalizeArrayParam(populate);
  if (populateValue) params.populate = populateValue;

  if (filters && typeof filters === "object") {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      params[key] = normalizeArrayParam(value) ?? value;
    });
  }

  return params;
};

const fetchDeveloperProfiles = async ({
  search,
  page,
  limit,
  start,
  populate,
  filters,
  sort,
  signal,
}) => {
  const { data } = await http.get("/api/developer-profiles", {
    params: buildParams({
      search,
      page,
      limit,
      start,
      populate,
      filters,
      sort,
    }),
    signal,
  });
  return data;
};

export const useDeveloperProfiles = ({
  search = "",
  page,
  limit = 20,
  start,
  populate,
  filters,
  sort,
  enabled = true,
} = {}) =>
  useQuery({
    queryKey: [
      "developer-profiles",
      { search, page, limit, start, populate, filters, sort },
    ],
    queryFn: ({ signal }) =>
      fetchDeveloperProfiles({
        search,
        page,
        limit,
        start,
        populate,
        filters,
        sort,
        signal,
      }),
    enabled,
  });

