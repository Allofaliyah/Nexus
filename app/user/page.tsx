
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  PlusCircle,
  MapPin,
  Bell,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useUser } from "@/app/context/UserContext";

export default function UserHomePage() {
  const { user } = useAuth();
  const {
    orders,
    unreadCount,
    loading,
    error,
    loadOrders,
    loadNotifications,
  } = useUser();

  useEffect(() => {
    loadOrders().catch(() => {});
    loadNotifications().catch(() => {});
  }, [loadOrders, loadNotifications]);

  const name =
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Customer";

  const inTransitCount = orders.filter((order) =>
    ["in_transit", "in transit"].includes(order.status.toLowerCase())
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status.toLowerCase() === "delivered"
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "In Transit",
      value: inTransitCount,
      icon: Truck,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
    {
      title: "Delivered",
      value: deliveredCount,
      icon: CheckCircle,
      color: "text-green-600",
      background: "bg-green-50",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          NEXUS LOGISTICS
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome, {name}
        </h1>
        <p className="mt-2 text-gray-500">
          Place orders and keep track of your deliveries.
        </p>
      </div>

      {/* Place an order */}
      <Link
        href="/user/orders/new"
        className="flex items-center justify-between gap-4 rounded-2xl bg-blue-600 p-6 text-white transition hover:bg-blue-700"
      >
        <div>
          <h2 className="text-xl font-semibold">Need a delivery?</h2>
          <p className="mt-1 text-sm text-blue-100">
            Create a new delivery order.
          </p>
        </div>
        <PlusCircle size={34} className="shrink-0" />
      </Link>

      {/* Order statistics */}
      <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, color, background }) => (
          <div key={title} className="rounded-xl border bg-white p-6">
            <div className={`mb-4 inline-flex rounded-lg p-3 ${background}`}>
              <Icon size={26} className={color} />
            </div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading && orders.length === 0 ? "—" : value}
            </p>
          </div>
        ))}
      </section>

      {/* Start tracking card */}
      <Link
        href="/user/tracking"
        className="group flex flex-col justify-between gap-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 transition hover:border-blue-300 sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-600 p-3 text-white">
            <MapPin size={28} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Start Tracking
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Check your tracking number and see the latest progress of your
              delivery.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 font-semibold text-blue-600 group-hover:text-blue-800">
          Track now <ArrowRight size={18} />
        </span>
      </Link>

      {/* Quick actions */}
      <section className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick actions
          </h2>

          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {unreadCount} unread notifications
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/user/orders"
            className="rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50"
          >
            View my orders
          </Link>

          <Link
            href="/user/tracking"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50"
          >
            <MapPin size={17} />
            Track an order
          </Link>

          <Link
            href="/user/notifications"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50"
          >
            <Bell size={17} />
            View notifications
          </Link>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          Could not load some of your information: {error}
          <button
            onClick={() => {
              loadOrders().catch(() => {});
              loadNotifications().catch(() => {});
            }}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Recent orders */}
      <section className="rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent orders
          </h2>
          <Link
            href="/user/orders"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>

        {loading && orders.length === 0 ? (
          <p className="mt-5 text-sm text-gray-500">
            Loading your orders...
          </p>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center">
            <Package size={32} className="mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-slate-700">
              No orders yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Your recent deliveries will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y">
            {[...orders]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 3)
              .map((order) => (
                <Link
                  key={order.id}
                  href={`/user/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-slate-900">
                      {order.trackingNumber}
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {order.deliveryAddress}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}