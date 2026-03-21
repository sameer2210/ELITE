import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { http } from "./config";

const DEFAULT_POPULATE = "developerId,category,technologies,awards";

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

const fetchProjects = async ({
  search,
  page,
  limit,
  start,
  populate,
  filters,
  sort,
  signal,
}) => {
  const { data } = await http.get("/api/projects", {
    params: buildParams({ search, page, limit, start, populate, filters, sort }),
    signal,
  });
  return data;
};

export const useProjects = ({
  search = "",
  page,
  limit = 20,
  start,
  populate = DEFAULT_POPULATE,
  filters,
  sort,
  enabled = true,
} = {}) =>
  useQuery({
    queryKey: [
      "projects",
      { search, page, limit, start, populate, filters, sort },
    ],
    queryFn: ({ signal }) =>
      fetchProjects({
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

export const useInfiniteProjects = ({
  search = "",
  limit = 6,
  populate = DEFAULT_POPULATE,
  filters,
  sort,
} = {}) =>
  useInfiniteQuery({
    queryKey: [
      "projects",
      { search, limit, populate, filters, sort, mode: "infinite" },
    ],
    queryFn: ({ pageParam = 0, signal }) =>
      fetchProjects({
        search,
        limit,
        start: pageParam,
        populate,
        filters,
        sort,
        signal,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage)) return undefined;
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

export const useProject = (id, { populate = DEFAULT_POPULATE } = {}) =>
  useQuery({
    queryKey: ["project", id, populate],
    queryFn: async ({ signal }) => {
      const { data } = await http.get(`/api/projects/${id}`, {
        params: buildParams({ populate }),
        signal,
      });
      return data;
    },
    enabled: Boolean(id),
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await http.post("/api/projects", payload);
      return data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (created?.id || created?._id) {
        queryClient.setQueryData(
          ["project", created.id || created._id, DEFAULT_POPULATE],
          created
        );
      }
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await http.patch(`/api/projects/${id}`, payload);
      return data;
    },
    onSuccess: (updated, variables) => {
      if (variables?.id) {
        queryClient.setQueryData(
          ["project", variables.id, DEFAULT_POPULATE],
          updated
        );
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await http.delete(`/api/projects/${id}`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
