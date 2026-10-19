
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search, RefreshCw } from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function MyOrdersPage() {
  const { orders, loading, error, loadOrders } = useUser();
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders().catch(() => {});
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter(
      (order) =>
        order.trackingNumber.toLowerCase().includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query) ||
        order.recipientName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
    );
  }, [orders, search]);

  function formatStatus(status: string) {
    return status.replace(/_/g, " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
  }

  function statusStyle(status: string) {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";
      case "in_transit":
      case "in transit":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-2 text-gray-500">
            View your delivery orders and their current status.
          </p>
        </div>

        <Link
          href="/user/orders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Place an Order
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
        <Search size={20} className="text-gray-400" />
        <input
          type="search"
          placeholder="Search by tracking number, destination, recipient, or status"
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Search orders"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={() => loadOrders().catch(() => {})}
            className="inline-flex items-center gap-2 font-semibold hover:underline"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="hidden grid-cols-4 gap-4 border-b bg-gray-50 p-4 text-xs font-semibold uppercase text-gray-500 sm:grid">
          <span>Order</span>
          <span>Destination</span>
          <span>Date</span>
          <span>Status</span>
        </div>

        {loading && orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading your orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center">
            <Package size={40} className="mx-auto mb-3 text-gray-400" />
            <h2 className="font-semibold text-slate-900">
              {search ? "No matching orders found" : "Your orders will appear here"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try another tracking number, recipient, destination, or status."
                : "You haven't created any orders yet."}
            </p>

            {!search && (
              <Link
                href="/user/orders/new"
                className="mt-5 inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
              >
                Create your first order <Plus size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/user/orders/${order.id}`}
                className="grid grid-cols-1 gap-3 p-4 transition hover:bg-gray-50 sm:grid-cols-4 sm:items-center sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 sm:hidden">Order</p>
                  <p className="break-all font-semibold text-slate-900">
                    {order.trackingNumber}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.recipientName}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500 sm:hidden">Destination</p>
                  <p className="break-words text-sm text-slate-700">
                    {order.deliveryAddress}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 sm:hidden">Date</p>
                  <p className="text-sm text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-500 sm:hidden">Status</p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
    </div>
  );
}
