
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Shield } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(password);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.replace("/login?passwordReset=true");
    } catch {
      setError("Could not reset your password. Request a new recovery link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create a new password for your Nexus account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              New password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none focus:border-black"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Updating password..." : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-black">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
