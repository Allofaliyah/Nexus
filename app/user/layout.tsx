
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  PackagePlus,
  MapPin,
  Bell,
  User,
  Menu,
  X,
  Truck,
} from "lucide-react";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { UserProvider } from "@/app/context/UserContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menu = [
    { name: "Home", href: "/user", icon: Home },
    { name: "My Orders", href: "/user/orders", icon: Package },
    {
      name: "Place an Order",
      href: "/user/orders/new",
      icon: PackagePlus,
    },
    { name: "Track Order", href: "/user/tracking", icon: MapPin },
    {
      name: "Notifications",
      href: "/user/notifications",
      icon: Bell,
    },
    { name: "Profile", href: "/user/profile", icon: User },
  ];

  function isActive(href: string) {
    if (href === "/user") return pathname === "/user";
    if (href === "/user/orders") {
      return (
        pathname === "/user/orders" ||
        /^\/user\/orders\/[^/]+$/.test(pathname)
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NEXUS</h1>
          <p className="mt-1 text-xs text-gray-500">Logistics Portal</p>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Close navigation menu"
        >
          <X size={22} />
        </button>
      </div>

      <div className="my-8 border-t" />

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                active
                  ? "bg-blue-600 font-semibold text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-xl bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Truck size={20} />
          <span className="font-semibold">Nexus Logistics</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Manage and track your deliveries in one place.
        </p>
      </div>
    </>
  );

  return (
    <ProtectedRoute allowedRole="user">
      <UserProvider>
        <div className="flex min-h-screen bg-gray-50">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 border-r bg-white p-5 lg:block">
            {sidebar}
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
          )}

          {/* Mobile slide-out sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r bg-white p-5 transition-transform duration-300 lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            aria-label="User navigation"
            aria-hidden={!sidebarOpen}
          >
            {sidebar}
          </aside>

          {/* Main content */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-700 hover:bg-gray-100"
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
              >
                <Menu size={24} />
              </button>

              <div>
                <h1 className="text-lg font-bold text-slate-900">NEXUS</h1>
                <p className="text-xs text-gray-500">Logistics Portal</p>
              </div>
            </header>

            <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </UserProvider>
    </ProtectedRoute>
  );
}
