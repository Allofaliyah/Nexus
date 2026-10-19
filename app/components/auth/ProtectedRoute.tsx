
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/app/context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRole: UserRole;
};

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // No authenticated user: return to login.
    if (!user) {
      router.replace("/login");
      return;
    }

    // Wait if the authenticated user's role has not loaded.
    if (!role) return;

    // Send users to the correct section.
    if (role !== allowedRole) {
      router.replace(role === "admin" ? "/admin" : "/user");
    }
  }, [user, role, loading, allowedRole, router]);

  // Never render protected content before checking access.
  if (loading || !user || !role || role !== allowedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500" />
          <p className="text-sm text-slate-400">
            Verifying your access to Nexus...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
