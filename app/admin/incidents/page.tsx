
"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  Clock,
  Search,
  X,
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

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "resolved":
    case "closed":
      return "bg-green-100 text-green-800";
    case "investigating":
      return "bg-blue-100 text-blue-800";
    case "contained":
      return "bg-purple-100 text-purple-800";
    case "open":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

export default function IncidentsPage() {
  const {
    incidents,
    loading,
    error,
    loadIncidents,
    updateIncident,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(
    null
  );
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    loadIncidents().catch(() => {});
  }, [loadIncidents]);

  const filteredIncidents = incidents.filter((incident) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      incident.title.toLowerCase().includes(searchTerm) ||
      incident.id.toLowerCase().includes(searchTerm) ||
      incident.status.toLowerCase().includes(searchTerm) ||
      incident.description.toLowerCase().includes(searchTerm);

    const matchesSeverity =
      severityFilter === "all" ||
      incident.severity.toLowerCase() === severityFilter;

    const matchesStatus =
      statusFilter === "all" ||
      incident.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const unresolvedCount = incidents.filter(
    (incident) =>
      !["resolved", "closed"].includes(incident.status.toLowerCase())
  ).length;

  const criticalCount = incidents.filter(
    (incident) =>
      incident.severity.toLowerCase() === "critical" &&
      !["resolved", "closed"].includes(incident.status.toLowerCase())
  ).length;

  const resolvedCount = incidents.filter((incident) =>
    ["resolved", "closed"].includes(incident.status.toLowerCase())
  ).length;

  async function handleStatusChange(id: string, status: string) {
    setActionError("");

    try {
      await updateIncident(id, { status });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update incident."
      );
    }
  }

  async function handleResolutionSave(id: string) {
    setActionError("");

    try {
      await updateIncident(id, {
        resolution: resolution.trim() || null,
      });

      setEditingIncidentId(null);
      setResolution("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save resolution."
      );
    }
  }

  function startEditingResolution(
    id: string,
    currentResolution?: string | null
  ) {
    setEditingIncidentId(id);
    setResolution(currentResolution ?? "");
    setActionError("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <ShieldAlert size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Security Incidents
            </h1>
            <p className="mt-1 text-gray-500">
              Review automatically detected incidents and manage their
              investigation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadIncidents().catch(() => {})}
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

      {(error || actionError) && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError || error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total incidents</p>
          <p className="mt-2 text-2xl font-bold">{incidents.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Unresolved incidents</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {unresolvedCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Critical unresolved</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {criticalCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Resolved incidents</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {resolvedCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search incidents..."
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 outline-none focus:border-slate-500"
          />
        </div>

        <select
          aria-label="Filter by severity"
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
          className="rounded-lg border bg-white px-3 py-2 outline-none focus:border-slate-500"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border bg-white px-3 py-2 outline-none focus:border-slate-500"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading && incidents.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Loading security incidents...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <ShieldAlert
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />
            <h2 className="font-semibold text-slate-900">
              No incidents found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {incidents.length === 0
                ? "No incidents have been detected yet."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isResolved = ["resolved", "closed"].includes(
              incident.status.toLowerCase()
            );

            const isEditing = editingIncidentId === incident.id;

            return (
              <article
                key={incident.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="break-all font-mono text-xs text-gray-500">
                    ID: {incident.id}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getSeverityStyle(incident.severity)}`}
                    >
                      {incident.severity}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(incident.status)}`}
                    >
                      {incident.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  {incident.title}
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {incident.description}
                </p>

                {incident.alertId && (
                  <p className="mt-3 break-all text-xs text-gray-500">
                    Related alert: {incident.alertId}
                  </p>
                )}

                <div className="mt-4 space-y-2 border-t pt-4">
                  <p className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={14} />
                    Created: {formatDate(incident.createdAt)}
                  </p>

                  {incident.assignedTo && (
                    <p className="break-all text-xs text-gray-500">
                      Assigned to: {incident.assignedTo}
                    </p>
                  )}

                  {incident.resolution && !isEditing && (
                    <p className="whitespace-pre-wrap text-sm text-gray-600">
                      <span className="font-medium">Resolution:</span>{" "}
                      {incident.resolution}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
                    <label
                      htmlFor={`resolution-${incident.id}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Resolution notes
                    </label>

                    <textarea
                      id={`resolution-${incident.id}`}
                      value={resolution}
                      onChange={(event) => setResolution(event.target.value)}
                      rows={4}
                      maxLength={10000}
                      placeholder="Describe the investigation outcome or corrective action..."
                      className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleResolutionSave(incident.id)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        Save resolution
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingIncidentId(null);
                          setResolution("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm hover:bg-white"
                      >
                        <X size={15} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!isResolved && !isEditing && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {incident.status.toLowerCase() === "open" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleStatusChange(incident.id, "investigating")
                        }
                        className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Start investigation
                      </button>
                    )}

                    {incident.status.toLowerCase() === "investigating" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleStatusChange(incident.id, "contained")
                        }
                        className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Mark contained
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        startEditingResolution(
                          incident.id,
                          incident.resolution
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      Add resolution notes
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleStatusChange(incident.id, "resolved")
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Resolve
                    </button>
                  </div>
                )}

                {isResolved && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <p className="text-sm text-green-700">
                      <CheckCircle size={16} className="mr-1 inline" />
                      This incident is {incident.status.toLowerCase()}.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        startEditingResolution(
                          incident.id,
                          incident.resolution
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit resolution notes
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
