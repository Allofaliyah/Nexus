
"use client";

import { useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";

function getSeverityStyle(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

export default function AlertsPage() {
  const {
    alerts,
    loading,
    error,
    loadAlerts,
    updateAlert,
  } = useAdmin();

  useEffect(() => {
    loadAlerts().catch(() => {});
  }, [loadAlerts]);

  async function handleUpdate(
    id: string,
    status: "acknowledged" | "resolved"
  ) {
    try {
      await updateAlert(id, status);
    } catch {
      // The AdminContext exposes the error state.
    }
  }

  const highPriorityCount = alerts.filter((alert) =>
    ["high", "critical"].includes(alert.severity.toLowerCase())
  ).length;

  const unresolvedCount = alerts.filter((alert) =>
    ["new", "acknowledged"].includes(alert.status.toLowerCase())
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <Bell size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Security Alerts
            </h1>
            <p className="mt-1 text-gray-500">
              Review automatically detected security alerts and take action.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadAlerts().catch(() => {})}
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
            onClick={() => loadAlerts().catch(() => {})}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total alerts</p>
          <p className="mt-2 text-2xl font-bold">{alerts.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">High / Critical</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {highPriorityCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Unresolved alerts</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {unresolvedCount}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading && alerts.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Loading security alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <ShieldAlert
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />
            <h2 className="font-semibold text-slate-900">
              No security alerts
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Automatically generated alerts will appear here when the
              security monitoring system detects a configured condition.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const severity = alert.severity || "unknown";
            const status = alert.status.toLowerCase();
            const isResolved = status === "resolved";
            const isAcknowledged = status === "acknowledged";

            return (
              <article
                key={alert.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="w-fit rounded-lg bg-gray-100 p-3">
                    {isResolved ? (
                      <CheckCircle
                        size={22}
                        className="text-green-600"
                      />
                    ) : (
                      <AlertTriangle
                        size={22}
                        className="text-orange-500"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {alert.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getSeverityStyle(severity)}`}
                      >
                        {severity}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                      {alert.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(alert.createdAt)}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        Status: {status}
                      </span>

                      {alert.source && (
                        <span className="rounded-full bg-gray-100 px-2 py-1">
                          Source: {alert.source}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isResolved && (
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {!isAcknowledged && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(alert.id, "acknowledged")
                          }
                          disabled={loading}
                          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(alert.id, "resolved")
                        }
                        disabled={loading}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
