
"use client";

import { useEffect } from "react";
import {
  Users,
  UserCheck,
  Bell,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";

export default function AdminDashboard() {
  const {
    users,
    orders,
    alerts,
    incidents,
    activity,
    loading,
    error,
    loadUsers,
    loadOrders,
    loadAlerts,
    loadIncidents,
    loadActivity,
  } = useAdmin();

  useEffect(() => {
    async function loadDashboard() {
      try {
        await Promise.all([
          loadUsers(),
          loadOrders(),
          loadAlerts(),
          loadIncidents(),
          loadActivity(),
        ]);
      } catch {
        // Errors are exposed through AdminContext.
      }
    }

    void loadDashboard();
  }, [
    loadUsers,
    loadOrders,
    loadAlerts,
    loadIncidents,
    loadActivity,
  ]);

  const activeUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: UserCheck,
    },
    {
      title: "Security Alerts",
      value: alerts.filter(
        (alert) => alert.status === "new"
      ).length,
      icon: Bell,
    },
    {
      title: "Incidents",
      value: incidents.filter(
        (incident) =>
          incident.status !== "resolved" &&
          incident.status !== "closed"
      ).length,
      icon: ShieldAlert,
    },
  ];

  const recentActivity = [...activity]
    .sort((a, b) => {
      const first = a as { createdAt?: string };
      const second = b as { createdAt?: string };

      return (
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
      );
    })
    .slice(0, 5);

  function formatTime(value?: string) {
    if (!value) return "Time unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Time unavailable";

    return date.toLocaleString();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Security Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor users, activity and security events across Nexus.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {loading ? "..." : stat.value}
                  </h2>
                </div>

                <Icon size={28} className="text-gray-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Activity size={22} />

          <h2 className="text-xl font-semibold">
            Recent Security Activity
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">
            {loading
              ? "Loading recent activity..."
              : "No activity records found."}
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {recentActivity.map((item, index) => {
              const record = item as {
                id?: string;
                action?: string;
                description?: string;
                createdAt?: string;
              };

              return (
                <div
                  key={record.id ?? index}
                  className="flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row"
                >
                  <div>
                    <p className="font-medium">
                      {record.action ?? "Activity recorded"}
                    </p>

                    {record.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {record.description}
                      </p>
                    )}
                  </div>

                  <span className="text-sm text-gray-500">
                    {formatTime(record.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Recent Orders
        </h2>

        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            {loading ? "Loading orders..." : "No orders found."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap justify-between gap-2 border-b pb-3"
              >
                <div>
                  <p className="font-medium">
                    {order.trackingNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.recipientName}
                  </p>
                </div>

                <span className="text-sm capitalize text-gray-600">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
