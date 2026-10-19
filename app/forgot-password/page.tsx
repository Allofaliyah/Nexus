
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Shield } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        "If an account exists for that email, a password recovery link will be sent."
      );
    } catch {
      setError("Could not request a password reset. Please try again.");
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
          <h1 className="text-2xl font-bold">Forgot password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email to receive a password recovery link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
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

          {success && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Recovery Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-black">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
