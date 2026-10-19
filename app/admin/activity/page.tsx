
"use client";

import { useEffect } from "react";
import {
  Activity,
  LogIn,
  ShoppingCart,
  LogOut,
  User,
  ShieldAlert,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";

type ActivityRecord = {
  id?: string;
  user?: string;
  userName?: string;
  email?: string;
  action?: string;
  activity?: string;
  eventType?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  ipAddress?: string;
};

export default function ActivityPage() {
  const { activity, loading, error, loadActivity } = useAdmin();

  useEffect(() => {
    loadActivity().catch(() => {});
  }, [loadActivity]);

  function getActivityIcon(item: ActivityRecord) {
    const action = (
      item.action ||
      item.activity ||
      item.eventType ||
      item.description ||
      ""
    ).toLowerCase();

    if (action.includes("login") || action.includes("sign in")) {
      return LogIn;
    }

    if (action.includes("logout") || action.includes("sign out")) {
      return LogOut;
    }

    if (action.includes("order")) {
      return ShoppingCart;
    }

    if (
      action.includes("alert") ||
      action.includes("security") ||
      action.includes("failed")
    ) {
      return ShieldAlert;
    }

    return User;
  }

  function formatDate(value?: string) {
    if (!value) return "Time unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  function getActivityDate(item: ActivityRecord) {
    return item.createdAt || item.timestamp;
  }

  function getActivityName(item: ActivityRecord) {
    return (
      item.userName ||
      item.user ||
      item.email ||
      "System user"
    );
  }

  function getActivityDescription(item: ActivityRecord) {
    return (
      item.action ||
      item.activity ||
      item.eventType ||
      item.description ||
      "Activity recorded"
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Activity size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              User Activity
            </h1>
            <p className="mt-1 text-gray-500">
              Monitor activities happening across Nexus.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadActivity().catch(() => {})}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => loadActivity().catch(() => {})}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="rounded-xl border bg-white">
        {loading && activity.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading user activity...
          </div>
        ) : activity.length === 0 ? (
          <div className="p-10 text-center">
            <Activity
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />
            <h2 className="font-semibold text-slate-900">
              No activity recorded yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              User and system activities will appear here when available
              from the activity API.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {[...activity]
              .reverse()
              .map((record, index) => {
                const item = record as ActivityRecord;
                const Icon = getActivityIcon(item);

                return (
                  <div
                    key={
                      item.id ||
                      `${getActivityName(item)}-${getActivityDate(item)}-${index}`
                    }
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="w-fit rounded-lg bg-gray-100 p-3 text-slate-700">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium text-slate-900">
                        {getActivityName(item)}
                      </p>
                      <p className="mt-1 break-words text-sm text-gray-500">
                        {getActivityDescription(item)}
                      </p>

                      {item.ipAddress && (
                        <p className="mt-1 text-xs text-gray-400">
                          IP address: {item.ipAddress}
                        </p>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 sm:text-sm">
                      <Clock size={14} />
                      {formatDate(getActivityDate(item))}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
