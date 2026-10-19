
"use client";

import { useState, type FormEvent } from "react";
import {
  MapPin,
  Search,
  PackageCheck,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function TrackingPage() {
  const {
    tracking,
    trackOrder,
    loading,
    error: contextError,
  } = useUser();

  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [searchError, setSearchError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSearchError("");

    if (!reference.trim()) {
      setSearchError("Please enter your order tracking number.");
      return;
    }

    try {
      await trackOrder(reference.trim());
      setMessage("Tracking information loaded successfully.");
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : "Unable to track this order. Please try again."
      );
    }
  }

  // The API may return { order: ... } or the order object directly.
  const trackingData = tracking as
    | {
        order?: Record<string, unknown>;
        statusHistory?: Array<Record<string, unknown>>;
        history?: Array<Record<string, unknown>>;
        trackingNumber?: string;
        status?: string;
        deliveryAddress?: string;
        recipientName?: string;
        createdAt?: string;
        updatedAt?: string;
      }
    | null;

  const order = trackingData?.order ?? trackingData;
  const history =
    trackingData?.statusHistory ?? trackingData?.history ?? [];

  function getString(
    value: unknown,
    fallback = ""
  ): string {
    return typeof value === "string" ? value : fallback;
  }

  function formatStatus(status: string) {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  const status = getString(order?.status);
  const trackingNumber = getString(
    order?.trackingNumber,
    reference.trim()
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <MapPin size={32} className="mb-3 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900">
          Track an Order
        </h1>
        <p className="mt-2 text-gray-500">
          Enter your order reference to check delivery progress.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-white p-6"
      >
        <label className="block text-sm font-medium text-slate-700">
          Order reference
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-50"
            placeholder="Enter your tracking number"
            required
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Tracking...
            </>
          ) : (
            <>
              <Search size={18} />
              Track order
            </>
          )}
        </button>
      </form>

      {(searchError || contextError) && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{searchError || contextError}</p>
        </div>
      )}

      {message && !searchError && !contextError && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </p>
      )}

      <div className="rounded-xl border bg-white p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <PackageCheck size={32} className="text-blue-600" />
          <div>
            <h2 className="font-semibold text-slate-900">
              Delivery progress
            </h2>
            <p className="text-sm text-gray-500">
              Your order's latest tracking information
            </p>
          </div>
        </div>

        {!order ? (
          <div className="py-6 text-center">
            <PackageCheck
              size={40}
              className="mx-auto mb-3 text-gray-400"
            />
            <p className="font-medium text-slate-700">
              No tracking information yet
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Enter your order's tracking number above to view its progress.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase text-blue-600">
                Tracking number
              </p>
              <p className="mt-1 break-all font-semibold text-slate-900">
                {trackingNumber}
              </p>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase text-blue-600">
                  Current status
                </p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700">
                  {status ? formatStatus(status) : "Status unavailable"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {getString(order.deliveryAddress) && (
                <div>
                  <p className="text-sm text-gray-500">
                    Delivery address
                  </p>
                  <p className="mt-1 font-medium text-slate-800">
                    {getString(order.deliveryAddress)}
                  </p>
                </div>
              )}

              {getString(order.recipientName) && (
                <div>
                  <p className="text-sm text-gray-500">Recipient</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {getString(order.recipientName)}
                  </p>
                </div>
              )}

              {getString(order.createdAt) && (
                <div>
                  <p className="text-sm text-gray-500">Order date</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {new Date(
                      getString(order.createdAt)
                    ).toLocaleString()}
                  </p>
                </div>
              )}

              {getString(order.updatedAt) && (
                <div>
                  <p className="text-sm text-gray-500">
                    Last updated
                  </p>
                  <p className="mt-1 font-medium text-slate-800">
                    {new Date(
                      getString(order.updatedAt)
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="border-t pt-5">
                <h3 className="mb-4 font-semibold text-slate-900">
                  Status history
                </h3>

                <div className="space-y-4">
                  {history.map((item, index) => {
                    const historyStatus = getString(
                      item.status,
                      "Status updated"
                    );
                    const historyDate = getString(
                      item.createdAt ?? item.changedAt ?? item.updatedAt
                    );

                    return (
                      <div
                        key={`${historyStatus}-${historyDate}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="mt-0.5 text-blue-600">
                          {index === 0 ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Clock size={20} />
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {formatStatus(historyStatus)}
                          </p>
                          {historyDate && (
                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(historyDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
