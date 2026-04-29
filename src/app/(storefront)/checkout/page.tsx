"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/ui/PageHeader";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
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
  { id: "jne-reg", courier: "JNE", service: "Reguler", etd: "2–3 hari", costPerKg: 18000 },
  { id: "jne-yes", courier: "JNE", service: "YES (Next Day)", etd: "1 hari", costPerKg: 32000 },
  { id: "jnt-reg", courier: "J&T", service: "EZ", etd: "2–4 hari", costPerKg: 16000 },
  { id: "sicepat-best", courier: "SiCepat", service: "BEST", etd: "1–2 hari", costPerKg: 22000 },
];

const PAYMENT_METHODS = [
  { id: "qris", label: "QRIS", desc: "Scan untuk bayar pakai e-wallet atau m-banking." },
  { id: "va", label: "Virtual Account", desc: "BCA, Mandiri, BRI, BNI, Permata." },
  { id: "transfer", label: "Transfer Bank", desc: "Transfer manual dengan konfirmasi." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, clear } = useCart();
  const { isReseller } = useSession();
  const totals = useMemo(
    () => calculateCartTotals(items, isReseller),
    [items, isReseller],
  );

  const [shippingId, setShippingId] = useState<string>(SHIPPING_OPTIONS[0].id);
  const [paymentId, setPaymentId] = useState<string>(PAYMENT_METHODS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
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
          Memuat…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader
          title="Checkout"
          description="Keranjang Anda kosong — tambahkan produk sebelum checkout."
          breadcrumbs={[{ label: "Checkout" }]}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <Link href="/shop" className="btn btn-primary inline-flex">
            Lihat Produk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    setSubmitting(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          customer: {
            fullName: String(data.get("full_name") ?? ""),
            phone: String(data.get("phone") ?? ""),
            email: String(data.get("email") ?? ""),
          },
          address: {
            province: String(data.get("province") ?? ""),
            city: String(data.get("city") ?? ""),
            district: String(data.get("district") ?? ""),
            postalCode: String(data.get("postal_code") ?? ""),
            address: String(data.get("address") ?? ""),
            notes: String(data.get("notes") ?? "") || null,
          },
          shippingId,
          paymentMethod: paymentId,
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        orderNumber?: string;
        subtotal?: number;
        shippingCost?: number;
        total?: number;
        itemCount?: number;
        shippingLabel?: string;
        paymentMethod?: string;
      };
      if (!res.ok || !body.orderNumber) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      try {
        sessionStorage.setItem(
          "jg.lastOrder",
          JSON.stringify({
            orderNumber: body.orderNumber,
            subtotal: body.subtotal ?? totals.subtotal,
            shippingCost: body.shippingCost ?? shippingCost,
            grandTotal: body.total ?? grandTotal,
            shipping:
              body.shippingLabel ?? `${shipping.courier} ${shipping.service}`,
            payment:
              PAYMENT_METHODS.find((p) => p.id === (body.paymentMethod ?? paymentId))
                ?.label ?? paymentId,
            itemCount: body.itemCount ?? totals.itemCount,
          }),
        );
      } catch {}
      clear();
      router.push(`/checkout/success?order=${body.orderNumber}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to place order");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Checkout"
        description="Selesaikan pembelian dengan aman di website kami. Kami tidak mengalihkan checkout ke WhatsApp."
        breadcrumbs={[
          { label: "Keranjang", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8"
      >
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-base font-semibold">Informasi Pelanggan</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="full_name">Nama lengkap</label>
                <input id="full_name" name="full_name" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Nomor HP / WhatsApp</label>
                <input id="phone" name="phone" required type="tel" className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" required type="email" className="input" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">Alamat Pengiriman</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="province">Provinsi</label>
                <input id="province" name="province" required className="input" placeholder="DKI Jakarta" />
              </div>
              <div>
                <label className="label" htmlFor="city">Kota / Kabupaten</label>
                <input id="city" name="city" required className="input" placeholder="Jakarta Selatan" />
              </div>
              <div>
                <label className="label" htmlFor="district">Kecamatan / Kelurahan</label>
                <input id="district" name="district" required className="input" placeholder="Kebayoran Baru" />
              </div>
              <div>
                <label className="label" htmlFor="postal_code">Kode pos</label>
                <input id="postal_code" name="postal_code" required className="input" placeholder="12930" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="address">Alamat lengkap</label>
                <textarea id="address" name="address" required className="input min-h-[90px] resize-y" placeholder="Jl. Contoh No. 123, Komplek …" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">Catatan (opsional)
                </label>
                <input id="notes" name="notes" className="input" placeholder="Titip ke security depan rumah" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">Metode Pengiriman</h2>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Tarif RajaOngkir / Komerce berdasarkan tujuan dan total berat.
              (Demo: tarif di bawah ilustrasi untuk {weightKg.toFixed(2)} kg.)
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
                        disabled={submitting}
                        onChange={() => setShippingId(opt.id)}
                        className="h-4 w-4 accent-[color:var(--color-navy-900)]"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          {opt.courier} · {opt.service}
                        </div>
                        <div className="text-xs text-[color:var(--color-muted)]">
                          Estimasi {opt.etd}
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
            <h2 className="text-base font-semibold">Metode Pembayaran</h2>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Pemrosesan pembayaran aman via Komerce (RajaOngkir Payment API).
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
                        disabled={submitting}
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
          <h2 className="text-base font-semibold">Ringkasan Pesanan</h2>
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
                Ongkos kirim ({shipping.courier} {shipping.service})
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
          {error && (
            <p
              role="alert"
              className="mt-5 text-sm text-[color:var(--color-error)]"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full mt-6"
          >
            {submitting ? "Membuat pesanan…" : "Buat pesanan & bayar"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
          <div className="mt-4 flex items-start gap-2 text-xs text-[color:var(--color-muted)]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--color-success)]" />
            <span>
              Pembayaran Anda diproses dengan aman. Total pesanan dikunci
              di server sebelum pembayaran.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
