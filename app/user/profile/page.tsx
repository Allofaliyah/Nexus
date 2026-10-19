"use client";

import { User, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const name =
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Customer";

  async function handleLogout() {
    const result = await logout();

    if (result.error) {
      alert(result.error);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          My Profile
        </h1>
        <p className="mt-2 text-gray-500">
          View your Nexus account details.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 md:p-8">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="rounded-full bg-blue-100 p-4">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {name}
            </h2>
            <p className="text-sm text-gray-500">Nexus customer</p>
          </div>
        </div>

        <div className="space-y-6 py-6">
          <div className="flex items-start gap-3">
            <User size={20} className="mt-1 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Full name</p>
              <p className="font-medium text-slate-900">{name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={20} className="mt-1 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email address</p>
              <p className="font-medium text-slate-900">
                {user?.email || "Not available"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-1 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Account status</p>
              <p className="font-medium text-slate-900">Signed in</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}