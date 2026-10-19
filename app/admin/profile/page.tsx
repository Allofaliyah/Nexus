
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserRound,
  Mail,
  CalendarDays,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    const result = await logout();

    if (result.error) {
      setError(result.error);
      setLoggingOut(false);
      return;
    }

    router.replace("/admin-login");
  }

  const name =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    "Administrator";

  const email = user?.email || "No email available";

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Unavailable";

  return (
    <ProtectedRoute allowedRole="admin">
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to admin home
          </Link>

          <div className="mb-8">
            <p className="text-sm font-medium text-blue-400">
              ACCOUNT SETTINGS
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Admin Profile
            </h1>

            <p className="mt-2 text-slate-400">
              View your Nexus administrator account information.
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-5 border-b border-slate-800 p-6 sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                <UserRound size={32} />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold">
                  {name}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-400">
                  {email}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-400">
                  <ShieldCheck size={14} />
                  Administrator
                </span>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 text-slate-400" size={20} />

                <div>
                  <p className="text-sm text-slate-400">
                    Email address
                  </p>
                  <p className="mt-1 break-all font-medium">
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 text-slate-400" size={20} />

                <div>
                  <p className="text-sm text-slate-400">
                    Account role
                  </p>
                  <p className="mt-1 font-medium">
                    {role === "admin" ? "Administrator" : "Not verified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 text-slate-400" size={20} />

                <div>
                  <p className="text-sm text-slate-400">
                    Account created
                  </p>
                  <p className="mt-1 font-medium">{createdAt}</p>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <div className="border-t border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900 bg-red-950/40 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-950 disabled:opacity-60"
                >
                  <LogOut size={17} />
                  {loggingOut ? "Signing out..." : "Log out"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
