"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/ui/PageHeader";
import { useCart } from "@/components/cart/CartProvider";
import { calculateCartTotals } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";

interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  etd: string;
  costPerKg: number;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "jne-reg", courier: "JNE", service: "Reguler", etd: "2–3 days", costPerKg: 18000 },
  { id: "jne-yes", courier: "JNE", service: "YES (Next Day)", etd: "1 day", costPerKg: 32000 },
  { id: "jnt-reg", courier: "J&T", service: "EZ", etd: "2–4 days", costPerKg: 16000 },
  { id: "sicepat-best", courier: "SiCepat", service: "BEST", etd: "1–2 days", costPerKg: 22000 },
];

const PAYMENT_METHODS = [
  { id: "qris", label: "QRIS", desc: "Scan to pay with any e-wallet or m-banking app." },
  { id: "va", label: "Virtual Account", desc: "BCA, Mandiri, BRI, BNI, Permata." },
  { id: "transfer", label: "Bank Transfer", desc: "Manual transfer with confirmation." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, clear } = useCart();
  const totals = useMemo(() => calculateCartTotals(items, false), [items]);

  const [shippingId, setShippingId] = useState<string>(SHIPPING_OPTIONS[0].id);
  const [paymentId, setPaymentId] = useState<string>(PAYMENT_METHODS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (submitTimerRef.current !== null) {
        clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }
    },
    [],
  );

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId)!;
  const weightKg = Math.max(0.5, totals.weightGram / 1000);
  const shippingCost = Math.ceil(weightKg) * shipping.costPerKg;
  const grandTotal = totals.subtotal + shippingCost;

  if (!isHydrated) {
    return (
      <div>
        <PageHeader title="Checkout" breadcrumbs={[{ label: "Checkout" }]} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-sm text-[color:var(--color-muted)]">
          Loading…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader
          title="Checkout"
          description="Your cart is empty — add a product before checking out."
          breadcrumbs={[{ label: "Checkout" }]}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <Link href="/shop" className="btn btn-primary inline-flex">
            Browse products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitTimerRef.current !== null) return;
    setSubmitting(true);
    // Stub: in production we'd POST to /api/checkout/create-order then
    // /api/checkout/create-payment with the Komerce/RajaOngkir provider.
    submitTimerRef.current = setTimeout(() => {
      submitTimerRef.current = null;
      const orderNumber = `JG-${Date.now().toString().slice(-7)}`;
      try {
        sessionStorage.setItem(
          "jg.lastOrder",
          JSON.stringify({
            orderNumber,
            subtotal: totals.subtotal,
            shippingCost,
            grandTotal,
            shipping: `${shipping.courier} ${shipping.service}`,
            payment: PAYMENT_METHODS.find((p) => p.id === paymentId)?.label,
            itemCount: totals.itemCount,
          }),
        );
      } catch {}
      clear();
      router.push(`/checkout/success?order=${orderNumber}`);
    }, 700);
  }

  return (
    <div>
      <PageHeader
        title="Checkout"
        description="Complete your purchase securely on-website. We never redirect you to WhatsApp for checkout."
        breadcrumbs={[
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8"
      >
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-base font-semibold">Customer information</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="full_name">Full name</label>
                <input id="full_name" name="full_name" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone (WhatsApp)</label>
                <input id="phone" name="phone" required type="tel" className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" required type="email" className="input" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">Shipping address</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="province">Province</label>
                <input id="province" name="province" required className="input" placeholder="DKI Jakarta" />
              </div>
              <div>
                <label className="label" htmlFor="city">City / Regency</label>
                <input id="city" name="city" required className="input" placeholder="Jakarta Selatan" />
              </div>
              <div>
                <label className="label" htmlFor="district">District / Subdistrict</label>
                <input id="district" name="district" required className="input" placeholder="Kebayoran Baru" />
              </div>
              <div>
                <label className="label" htmlFor="postal_code">Postal code</label>
                <input id="postal_code" name="postal_code" required className="input" placeholder="12930" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="address">Full address</label>
                <textarea id="address" name="address" required className="input min-h-[90px] resize-y" placeholder="Jl. Example No. 123, Komplek …" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">Notes (optional)</label>
                <input id="notes" name="notes" className="input" placeholder="Leave with the security guard" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">Shipping method</h2>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Live RajaOngkir / Komerce rates based on destination and total
              weight. (Demo: rates below are illustrative for {weightKg.toFixed(2)} kg.)
            </p>
            <ul className="mt-4 space-y-2.5">
              {SHIPPING_OPTIONS.map((opt) => {
                const optCost = Math.ceil(weightKg) * opt.costPerKg;
                const selected = shippingId === opt.id;
                return (
                  <li key={opt.id}>
                    <label
                      className={clsx(
                        "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
                        selected
                          ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)]/[0.03]"
                          : "border-[color:var(--color-line)] hover:border-[color:var(--color-navy-300)]",
                      )}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={selected}
                        onChange={() => setShippingId(opt.id)}
                        className="h-4 w-4 accent-[color:var(--color-navy-900)]"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          {opt.courier} · {opt.service}
                        </div>
                        <div className="text-xs text-[color:var(--color-muted)]">
                          Estimated {opt.etd}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[color:var(--color-navy-900)]">
                        {formatRupiah(optCost)}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">Payment method</h2>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Secure payment processing via Komerce (RajaOngkir Payment API).
            </p>
            <ul className="mt-4 space-y-2.5">
              {PAYMENT_METHODS.map((m) => {
                const selected = paymentId === m.id;
                return (
                  <li key={m.id}>
                    <label
                      className={clsx(
                        "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
                        selected
                          ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)]/[0.03]"
                          : "border-[color:var(--color-line)] hover:border-[color:var(--color-navy-300)]",
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={selected}
                        onChange={() => setPaymentId(m.id)}
                        className="h-4 w-4 mt-0.5 accent-[color:var(--color-navy-900)]"
                      />
                      <div>
                        <div className="text-sm font-semibold">{m.label}</div>
                        <div className="text-xs text-[color:var(--color-muted)] mt-0.5">{m.desc}</div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-base font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {totals.lineItems.map(({ item, pricing }) => (
              <li key={item.productId} className="flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold line-clamp-1">{item.name}</div>
                  <div className="text-xs text-[color:var(--color-muted)]">
                    {item.quantity} × {formatRupiah(pricing.unitPrice)}
                    {pricing.tierLabel ? ` · ${pricing.tierLabel}` : ""}
                  </div>
                </div>
                <div className="font-semibold whitespace-nowrap">
                  {formatRupiah(pricing.subtotal)}
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-5 pt-5 border-t border-[color:var(--color-line)] space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">Subtotal</dt>
              <dd className="font-semibold">{formatRupiah(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">
                Shipping ({shipping.courier} {shipping.service})
              </dt>
              <dd className="font-semibold">{formatRupiah(shippingCost)}</dd>
            </div>
          </dl>
          <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-[color:var(--color-navy-900)]">
              {formatRupiah(grandTotal)}
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full mt-6"
          >
            {submitting ? "Creating order…" : "Place order & pay"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
          <div className="mt-4 flex items-start gap-2 text-xs text-[color:var(--color-muted)]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--color-success)]" />
            <span>
              Your payment is processed securely. Order amount is locked
              server-side before payment.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
