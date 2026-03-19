import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./config";

const buildNotificationParams = ({ isRead, limit, start } = {}) => {
  const params = {};

  if (typeof isRead === "boolean") {
    params.isRead = isRead;
  }
  if (typeof limit === "number") {
    params._limit = limit;
  }
  if (typeof start === "number") {
    params._start = start;
  }

  return params;
};

const fetchNotifications = async ({ isRead, limit, start, signal } = {}) => {
  const { data } = await http.get("/api/notifications", {
    params: buildNotificationParams({ isRead, limit, start }),
    signal,
  });

  return Array.isArray(data) ? data : [];
};

export const useNotifications = ({
  isRead,
  limit,
  start,
  enabled = true,
} = {}) =>
  useQuery({
    queryKey: ["notifications", { isRead, limit, start }],
    queryFn: ({ signal }) =>
      fetchNotifications({ isRead, limit, start, signal }),
    enabled,
  });

export const useHasUnreadNotifications = ({ userId, enabled = true } = {}) =>
  useQuery({
    queryKey: ["notifications", "has-unread", userId || null],
    queryFn: async ({ signal }) => {
      const unread = await fetchNotifications({
        isRead: false,
        limit: 1,
        signal,
      });
      return unread.length > 0;
    },
    enabled: enabled && Boolean(userId),
    refetchInterval: 30_000,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await http.patch(`/api/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
