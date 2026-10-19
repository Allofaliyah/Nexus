
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  Save,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";

const orderStatuses = [
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "in_transit":
      return "bg-purple-100 text-purple-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminOrdersPage() {
  const {
    orders,
    loading,
    error,
    loadOrders,
    updateOrderStatus,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, string>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    void loadOrders().catch(() => {
      // The context stores the loading error.
    });
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch = [
        order.trackingNumber,
        order.recipientName,
      ].some((value) =>
        (value ?? "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "all" ||
        order.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter(
    (order) => order.status.toLowerCase() === "pending"
  ).length;

  const transitCount = orders.filter(
    (order) => order.status.toLowerCase() === "in_transit"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status.toLowerCase() === "delivered"
  ).length;

  function handleStatusChange(orderId: string, status: string) {
    setSelectedStatuses((previous) => ({
      ...previous,
      [orderId]: status,
    }));

    setSuccessMessage("");
    setPageError("");
  }

  async function handleSave(orderId: string, currentStatus: string) {
    const newStatus = selectedStatuses[orderId];

    if (!newStatus || newStatus === currentStatus) return;

    setSavingId(orderId);
    setPageError("");
    setSuccessMessage("");

    try {
      await updateOrderStatus(orderId, newStatus);

      setSelectedStatuses((previous) => {
        const next = { ...previous };
        delete next[orderId];
        return next;
      });

      setSuccessMessage("Order status updated successfully.");
    } catch (err) {
      setPageError(
        err instanceof Error
          ? err.message
          : "Could not update order status."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleRefresh() {
    setPageError("");
    setSuccessMessage("");

    try {
      await loadOrders();
    } catch {
      setPageError("Could not refresh orders. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Package size={28} />
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Orders
            </h1>
          </div>

          <p className="mt-3 text-gray-500">
            Monitor logistics orders and manage their delivery status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          className="rounded-lg bg-green-50 p-4 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {(pageError || error) && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p>{pageError || error}</p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total orders</p>
            <Package size={20} className="text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Pending</p>
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">In transit</p>
            <Truck size={20} className="text-purple-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {transitCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Delivered</p>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {deliveredCount}
          </p>
        </div>
      </div>

      {/* Search and filter */}
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
            placeholder="Search tracking number or recipient..."
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 outline-none focus:border-slate-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border bg-white px-3 py-2 outline-none focus:border-slate-500"
          aria-label="Filter orders by status"
        >
          <option value="all">All statuses</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {loading && orders.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />

            <h2 className="font-semibold text-slate-900">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {orders.length === 0
                ? "There are no orders to display yet."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold">
                    Tracking number
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Recipient
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Current status
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Order date
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Update status
                  </th>
                  <th className="p-4 text-sm font-semibold">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredOrders.map((order) => {
                  const selectedStatus =
                    selectedStatuses[order.id] ?? order.status;

                  const hasChanges =
                    selectedStatus !== order.status;

                  const isSaving = savingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-slate-800">
                          {order.trackingNumber || "—"}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-700">
                        {order.recipientName || "Unknown recipient"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyle(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedStatus}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value
                              )
                            }
                            disabled={isSaving}
                            aria-label={`Change status for ${order.trackingNumber}`}
                            className="min-w-32 rounded-lg border bg-white px-3 py-2 text-sm capitalize outline-none focus:border-blue-500 disabled:opacity-50"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              void handleSave(order.id, order.status)
                            }
                            disabled={!hasChanges || isSaving}
                            title="Save status"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {isSaving ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={16} />
                            )}

                            <span>
                              {isSaving ? "Saving" : "Save"}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Link to the individual order page */}
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                        >
                          <Eye size={16} />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredOrders.length} of {orders.length} orders.
      </p>
    </main>
  );
}
