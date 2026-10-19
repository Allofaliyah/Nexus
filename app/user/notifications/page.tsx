
"use client";

import { useEffect } from "react";
import { Bell, Package, CheckCircle, Clock } from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markNotificationRead,
  } = useUser();

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [loadNotifications]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Bell size={32} className="mb-3 text-blue-600" />

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            Notifications
          </h1>

          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {unreadCount} unread
            </span>
          )}
        </div>

        <p className="mt-2 text-gray-500">
          Keep up with updates about your deliveries.
        </p>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="flex items-center gap-4 border-b p-5">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Package size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Order updates
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Order confirmations and status changes will appear here.
            </p>
          </div>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
              <button
                onClick={() => loadNotifications().catch(() => {})}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading && notifications.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5 text-center">
              <CheckCircle
                size={36}
                className="mx-auto mb-3 text-gray-400"
              />
              <p className="font-medium text-slate-700">
                No notifications yet
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Notifications will appear here when there are updates
                about your orders.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const isRead = Boolean(notification.readAt);

                return (
                  <div
                    key={notification.id}
                    className={`flex gap-4 rounded-lg p-4 ${
                      isRead ? "bg-white" : "bg-blue-50/70"
                    }`}
                  >
                    <div className="h-fit rounded-lg bg-blue-100 p-3 text-blue-600">
                      {isRead ? (
                        <CheckCircle size={22} />
                      ) : (
                        <Bell size={22} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {notification.title}
                        </h3>

                        {!isRead && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={13} />
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>

                      {!isRead && (
                        <button
                          disabled={loading}
                          onClick={() =>
                            markNotificationRead(notification.id).catch(
                              () => {}
                            )
                          }
                          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
