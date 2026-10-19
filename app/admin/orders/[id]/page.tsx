
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  UserRound,
  Hash,
  CalendarDays,
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

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unavailable";
  }

  return parsedDate.toLocaleString();
}

function statusStyle(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "in_transit":
      return "bg-blue-100 text-blue-700";
    case "confirmed":
      return "bg-purple-100 text-purple-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = typeof params.id === "string" ? params.id : "";

  const { orders, loadOrders, updateOrderStatus } = useAdmin();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      setPageLoading(true);
      setError("");

      try {
        await loadOrders();
      } catch {
        if (active) {
          setError("Could not load the order. Please try again.");
        }
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      active = false;
    };
  }, [id, loadOrders]);

  const order = orders.find((item) => item.id === id);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order?.id, order?.status]);

  async function handleStatusUpdate() {
    if (!order || !selectedStatus) return;

    if (selectedStatus === order.status) {
      setError("Please select a different status before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateOrderStatus(order.id, selectedStatus);
      setSuccess("Order status updated successfully.");
    } catch {
      setError("Failed to update the order status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading order details...
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="p-6">
        <Link
          href="/admin/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900">
            Order not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This order may not exist or could not be loaded.
          </p>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={() => router.push("/admin/orders")}
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Return to orders
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-700" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Tracking number: {order.trackingNumber}
                </p>
              </div>
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-sm font-medium ${statusStyle(order.status)}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order information */}
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Order Information
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Hash className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="mt-1 break-all text-sm font-medium text-gray-900">
                    {order.id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="mt-1 break-all text-sm font-medium text-gray-900">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date Created</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatStatus(order.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer information */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Customer Information
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <UserRound className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Recipient Name</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {order.recipientName || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer User ID</p>
                  <p className="mt-1 break-all text-sm font-medium text-gray-900">
                    {order.userId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Update status */}
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Update Order Status
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose the new status and save your changes.
          </p>

          <label
            htmlFor="order-status"
            className="mb-2 mt-5 block text-sm font-medium text-gray-700"
          >
            New Status
          </label>

          <select
            id="order-status"
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value);
              setError("");
              setSuccess("");
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {selectedStatus === "delivered" ? (
                <CheckCircle className="h-4 w-4" />
              ) : selectedStatus === "cancelled" ? (
                <XCircle className="h-4 w-4" />
              ) : selectedStatus === "pending" ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Truck className="h-4 w-4" />
              )}

              <span>
                Selected:{" "}
                <strong className="text-gray-900">
                  {formatStatus(selectedStatus)}
                </strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={
              saving ||
              !selectedStatus ||
              selectedStatus === order.status
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Status
              </>
            )}
          </button>

          <p className="mt-3 text-xs leading-5 text-gray-500">
            The status is saved through your existing admin API. Only authorized
            administrators should be allowed to update orders.
          </p>
        </aside>
      </div>
    </main>
  );
}
