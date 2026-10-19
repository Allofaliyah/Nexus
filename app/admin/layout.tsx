"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  Bell,
  ShieldAlert,
  UserRound,
  Package,
} from "lucide-react";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { AdminProvider } from "@/app/context/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Activity",
      href: "/admin/activity",
      icon: Activity,
    },
    {
      name: "Logs",
      href: "/admin/logs",
      icon: FileText,
    },
    {
      name: "Alerts",
      href: "/admin/alerts",
      icon: Bell,
    },
    {
      name: "Incidents",
      href: "/admin/incidents",
      icon: ShieldAlert,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: Package,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: UserRound,
    },
  ];

  return (
    <ProtectedRoute allowedRole="admin">
      <AdminProvider>
        <div className="flex min-h-screen bg-gray-50">
          <aside className="w-64 shrink-0 border-r bg-white p-5">
            <h1 className="mb-10 text-2xl font-bold tracking-wide">
              NEXUS
            </h1>

            <nav className="space-y-2">
              {menu.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 p-8">
            {children}
          </main>
        </div>
      </AdminProvider>
    </ProtectedRoute>
  );
}