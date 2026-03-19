import React from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import {
  useMarkNotificationRead,
  useNotifications,
} from "../../api/notifications";

const NOTIFICATION_TYPE_LABELS = {
  NEW_PROJECT_MATCH: "New Project Match",
  PROJECT_REQUEST: "Project Request",
  NEW_MESSAGE: "New Message",
  AWARD_RECEIVED: "Award Received",
};

const formatTimestamp = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString();
};

const Notifications = () => {
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotifications();
  const markNotificationRead = useMarkNotificationRead();

  return (
    <section className="min-h-[calc(100vh-180px)] bg-stone-950 text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2.5">
              <Bell className="h-5 w-5" strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
                Notifications
              </h1>
              <p className="text-sm text-white/65">
                View your latest project and account updates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-white/10 transition"
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              strokeWidth={1.7}
            />
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="py-14 text-center text-white/70">
            Loading notifications...
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-sm text-red-200">
              {error?.response?.data?.message ||
                "Unable to load notifications right now."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-red-500 transition"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-white/75">No notifications yet.</p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="mt-6 space-y-3">
            {notifications.map((notification) => {
              const isMarkingThis =
                markNotificationRead.isPending &&
                markNotificationRead.variables === notification._id;

              return (
                <article
                  key={notification._id}
                  className={`rounded-2xl border p-4 sm:p-5 transition ${
                    notification.isRead
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-teal-400/30 bg-teal-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                        )}
                        <p className="text-sm font-semibold tracking-wide">
                          {NOTIFICATION_TYPE_LABELS[notification.type] ||
                            "Notification"}
                        </p>
                      </div>
                      <p className="mt-1.5 text-sm text-white/90">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-white/50">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          markNotificationRead.mutate(notification._id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isMarkingThis}
                      >
                        <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
                        {isMarkingThis ? "Marking..." : "Mark Read"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
