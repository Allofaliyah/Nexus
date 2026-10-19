
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PackagePlus, Loader2 } from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function NewOrderPage() {
  const router = useRouter();
  const { createOrder, loading, error: contextError } = useUser();

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    recipientName: "",
    recipientPhone: "",
    packageType: "Parcel",
    description: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const order = await createOrder({
        pickupAddress: form.pickupAddress.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        packageType: form.packageType,
        description: [
          form.description.trim(),
          form.notes.trim()
            ? `Additional instructions: ${form.notes.trim()}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });

      if (order) {
        router.push("/user/orders");
      } else {
        setError(
          "Your order could not be confirmed. Please check your orders before submitting again."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your order. Please try again."
      );
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/user/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft size={17} /> Back to orders
      </Link>

      <div>
        <PackagePlus size={32} className="mb-3 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900">
          Place an Order
        </h1>
        <p className="mt-2 text-gray-500">
          Enter the details of the package you want delivered.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border bg-white p-6 md:p-8"
      >
        <section>
          <h2 className="font-semibold text-slate-900">
            Pickup and delivery
          </h2>

          <label className="mt-4 block text-sm font-medium">
            Pickup address *
            <input
              name="pickupAddress"
              value={form.pickupAddress}
              onChange={handleChange}
              className={inputClass}
              placeholder="Where should we collect the package?"
              required
              disabled={loading}
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Delivery address *
            <input
              name="deliveryAddress"
              value={form.deliveryAddress}
              onChange={handleChange}
              className={inputClass}
              placeholder="Where should we deliver it?"
              required
              disabled={loading}
            />
          </label>
        </section>

        <section className="border-t pt-6">
          <h2 className="font-semibold text-slate-900">
            Recipient details
          </h2>

          <label className="mt-4 block text-sm font-medium">
            Recipient name *
            <input
              name="recipientName"
              value={form.recipientName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Recipient's full name"
              required
              disabled={loading}
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Recipient phone number *
            <input
              name="recipientPhone"
              type="tel"
              value={form.recipientPhone}
              onChange={handleChange}
              className={inputClass}
              placeholder="Recipient's phone number"
              required
              disabled={loading}
            />
          </label>
        </section>

        <section className="border-t pt-6">
          <h2 className="font-semibold text-slate-900">
            Package information
          </h2>

          <label className="mt-4 block text-sm font-medium">
            Package type *
            <select
              name="packageType"
              value={form.packageType}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            >
              <option>Parcel</option>
              <option>Documents</option>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Food items</option>
              <option>Other</option>
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium">
            Package description *
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={inputClass}
              rows={3}
              placeholder="Describe the package"
              required
              disabled={loading}
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Additional instructions
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className={inputClass}
              rows={3}
              placeholder="Optional delivery instructions"
              disabled={loading}
            />
          </label>
        </section>

        {(error || contextError) && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {error || contextError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting Order...
            </>
          ) : (
            <>
              <PackagePlus size={18} />
              Submit Order
            </>
          )}
        </button>
      </form>
    </div>
  );
}
