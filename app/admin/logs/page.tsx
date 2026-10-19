
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";

type LogRecord = {
  id: string;
  actorId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value == null) return "Not provided";

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "None";

    return value.map(formatValue).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nestedValue]) => {
        return `${formatLabel(key)}: ${formatValue(nestedValue)}`;
      })
      .join("; ");
  }

  return "Details unavailable";
}

function formatDetails(details: unknown): string {
  if (details == null) return "No additional details";

  if (typeof details === "string") {
    const trimmed = details.trim();

    if (!trimmed) return "No additional details";

    // Convert JSON strings into readable text where possible.
    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (parsed !== null && typeof parsed === "object") {
        return formatValue(parsed);
      }

      return String(parsed);
    } catch {
      return trimmed;
    }
  }

  if (typeof details === "object") {
    return formatValue(details);
  }

  return String(details);
}

export default function LogsPage() {
  const { logs, loading, error, loadLogs } = useAdmin();

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLogs().catch(() => {});
  }, [loadLogs]);

  const logRecords = useMemo(
    () => logs as LogRecord[],
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return logRecords;

    return logRecords.filter((log) =>
      [
        log.actorId,
        log.action,
        log.resourceType,
        log.resourceId,
        log.ipAddress,
        formatDetails(log.details),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [logRecords, search]);

  const ipAddressCount = logRecords.filter(
    (log) => log.ipAddress
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <FileText size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              System Logs
            </h1>
            <p className="mt-1 text-gray-500">
              Review administrative actions and recorded system events.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadLogs().catch(() => {})}
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
            onClick={() => loadLogs().catch(() => {})}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Loaded log records
          </p>
          <p className="mt-2 text-2xl font-bold">
            {logs.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Recorded IP addresses
          </p>
          <p className="mt-2 text-2xl font-bold">
            {ipAddressCount}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search action, actor ID, resource, IP address..."
          className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 outline-none focus:border-slate-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading && logs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Loading system logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldAlert
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />

            <h2 className="font-semibold text-slate-900">
              No logs found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "No audit records are available yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold">
                    Actor ID
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Action
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Resource
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Details
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    IP Address
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">
                      {log.actorId || "System"}
                    </td>

                    <td className="p-4 text-sm font-medium">
                      {formatLabel(log.action || "Unknown action")}
                    </td>

                    <td className="p-4 text-sm">
                      <div>
                        {log.resourceType
                          ? formatLabel(log.resourceType)
                          : "—"}
                      </div>

                      {log.resourceId && (
                        <div className="mt-1 max-w-40 truncate font-mono text-xs text-gray-500">
                          {log.resourceId}
                        </div>
                      )}
                    </td>

                    <td className="max-w-80 p-4 text-sm text-gray-600">
                      <p className="whitespace-normal break-words leading-6">
                        {formatDetails(log.details)}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-gray-500">
                      {log.ipAddress || "—"}
                    </td>

                    <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredLogs.length} of {logs.length} loaded log records.
      </p>
    </div>
  );
}
