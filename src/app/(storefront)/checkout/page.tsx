"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, X, Copy, Check, QrCode, CreditCard, Building2 } from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/ui/PageHeader";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { calculateCartTotals } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";
import AreaSearch from "@/components/checkout/AreaSearch";
import ShippingRates, {
  type ShippingRate,
} from "@/components/checkout/ShippingRates";

const PAYMENT_METHODS = [
  {
    id: "qris",
    label: "QRIS",
    desc: "Scan untuk bayar pakai e-wallet atau m-banking.",
    icon: QrCode,
  },
  // Virtual Account — dinonaktifkan sementara
  // {
  //   id: "va",
  //   label: "Virtual Account",
  //   desc: "BCA, Mandiri, BRI, BNI, Permata.",
  //   icon: CreditCard,
  // },
  {
    id: "transfer",
    label: "Transfer Bank",
    desc: "Transfer manual dengan konfirmasi.",
    icon: Building2,
  },
];

/** Bank account info for manual transfer */
const BANK_ACCOUNTS = [
  { bank: "BCA", number: "1234567890", name: "Juragan Grosir" },
  { bank: "BRI", number: "0987654321", name: "Juragan Grosir" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, clear } = useCart();
  const { isReseller } = useSession();
  const totals = useMemo(
    () => calculateCartTotals(items, isReseller),
    [items, isReseller],
  );

  // Address
  const [selectedArea, setSelectedArea] = useState<{
    id: string;
    label: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
  } | null>(null);

  // Shipping
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const shippingRateId = selectedRate
    ? `${selectedRate.courierCode}::${selectedRate.courierServiceCode}`
    : null;

  // Payment
  const [paymentId, setPaymentId] = useState<string>(PAYMENT_METHODS[0].id);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    total: number;
    paymentMethod: string;
  } | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

  // Reset shipping when area changes
  const handleAreaSelect = useCallback(
    (area: {
      id: string;
      label: string;
      province: string;
      city: string;
      district: string;
      postalCode: string;
    }) => {
      setSelectedArea(area);
      setSelectedRate(null);
    },
    [],
  );

  const handleRateSelect = useCallback((rate: ShippingRate) => {
    setSelectedRate(rate);
  }, []);

  const shippingCost = selectedRate?.price ?? 0;
  const grandTotal = totals.subtotal + shippingCost;

  // Cart items simplified for shipping rate request
  const cartItemsForRate = useMemo(
    () =>
      items.map((it) => ({
        name: it.name,
        retailPrice: it.retailPrice,
        weightGram: it.weightGram,
        quantity: it.quantity,
      })),
    [items],
  );

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
    if (!selectedArea) {
      setError("Pilih kota / kecamatan tujuan terlebih dahulu.");
      return;
    }
    if (!selectedRate) {
      setError("Pilih metode pengiriman terlebih dahulu.");
      return;
    }
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
            province: selectedArea.province,
            city: selectedArea.city,
            district: selectedArea.district,
            postalCode: selectedArea.postalCode,
            address: String(data.get("address") ?? ""),
            notes: String(data.get("notes") ?? "") || null,
          },
          shipping: {
            courierCode: selectedRate.courierCode,
            courierServiceCode: selectedRate.courierServiceCode,
            destinationPostalCode: selectedArea.postalCode,
          },
          paymentMethod: paymentId,
          items: items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
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
      // Store order data for success page
      try {
        sessionStorage.setItem(
          "jg.lastOrder",
          JSON.stringify({
            orderNumber: body.orderNumber,
            subtotal: body.subtotal ?? totals.subtotal,
            shippingCost: body.shippingCost ?? shippingCost,
            grandTotal: body.total ?? grandTotal,
            shipping:
              body.shippingLabel ??
              `${selectedRate.courierName} ${selectedRate.courierServiceName}`,
            payment:
              PAYMENT_METHODS.find(
                (p) => p.id === (body.paymentMethod ?? paymentId),
              )?.label ?? paymentId,
            itemCount: body.itemCount ?? totals.itemCount,
          }),
        );
      } catch {}
      // Show payment modal instead of immediate redirect
      setOrderResult({
        orderNumber: body.orderNumber,
        total: body.total ?? grandTotal,
        paymentMethod: body.paymentMethod ?? paymentId,
      });
      setShowPaymentModal(true);
      setSubmitting(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to place order");
      setSubmitting(false);
    }
  }

  function handlePaymentConfirm() {
    clear();
    router.push(`/checkout/success?order=${orderResult?.orderNumber}`);
  }

  return (
    <div>
      <PageHeader
        title="Checkout"
        description="Selesaikan pembelian dengan aman di website kami."
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
          {/* Customer Info */}
          <section className="card p-6">
            <h2 className="text-base font-semibold">Informasi Pelanggan</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="full_name">
                  Nama lengkap
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  Nomor HP / WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  required
                  type="tel"
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  required
                  type="email"
                  className="input"
                />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="card p-6">
            <h2 className="text-base font-semibold">Alamat Pengiriman</h2>
            <div className="mt-5 space-y-4">
              <AreaSearch
                onSelect={handleAreaSelect}
                disabled={submitting}
              />
              {selectedArea && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-[fadeIn_200ms_ease-out]">
                  <div>
                    <span className="label">Provinsi</span>
                    <div className="input bg-[color:var(--color-cloud-50)] text-[color:var(--color-ink)]">
                      {selectedArea.province}
                    </div>
                  </div>
                  <div>
                    <span className="label">Kota / Kabupaten</span>
                    <div className="input bg-[color:var(--color-cloud-50)] text-[color:var(--color-ink)]">
                      {selectedArea.city}
                    </div>
                  </div>
                  <div>
                    <span className="label">Kode Pos</span>
                    <div className="input bg-[color:var(--color-cloud-50)] text-[color:var(--color-ink)]">
                      {selectedArea.postalCode}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="label" htmlFor="address">
                  Alamat lengkap
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  className="input min-h-[90px] resize-y"
                  placeholder="Jl. Contoh No. 123, Komplek …"
                />
              </div>
              <div>
                <label className="label" htmlFor="notes">
                  Catatan (opsional)
                </label>
                <input
                  id="notes"
                  name="notes"
                  className="input"
                  placeholder="Titip ke security depan rumah"
                />
              </div>
            </div>
          </section>

          {/* Shipping Method — live rates */}
          <section className="card p-6">
            <h2 className="text-base font-semibold">Metode Pengiriman</h2>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Tarif kurir real-time dari Biteship berdasarkan tujuan dan total
              berat ({(totals.weightGram / 1000).toFixed(2)} kg).
            </p>
            <div className="mt-4">
              <ShippingRates
                postalCode={selectedArea?.postalCode ?? null}
                items={cartItemsForRate}
                selectedId={shippingRateId}
                onSelect={handleRateSelect}
                disabled={submitting}
              />
            </div>
          </section>

          {/* Payment Method */}
          <section className="card p-6">
            <h2 className="text-base font-semibold">Metode Pembayaran</h2>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Pemrosesan pembayaran aman.
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
                        <div className="text-xs text-[color:var(--color-muted)] mt-0.5">
                          {m.desc}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="card p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-base font-semibold">Ringkasan Pesanan</h2>
          <ul className="mt-4 space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {totals.lineItems.map(({ item, pricing }) => (
              <li
                key={item.lineId}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-semibold line-clamp-1">{item.name}</div>
                  {item.variantLabel ? (
                    <div className="text-xs text-[color:var(--color-navy-900)]">
                      {item.variantLabel}
                    </div>
                  ) : null}
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
              <dd className="font-semibold">
                {formatRupiah(totals.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">
                Ongkos kirim
                {selectedRate
                  ? ` (${selectedRate.courierName.toUpperCase() === "JNT" ? "J&T" : selectedRate.courierName.toUpperCase() === "SENTRALCARGO" ? "Central Cargo" : selectedRate.courierName.toUpperCase()} ${selectedRate.courierServiceName})`
                  : ""}
              </dt>
              <dd className="font-semibold">
                {selectedRate ? formatRupiah(shippingCost) : "—"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-[color:var(--color-navy-900)]">
              {selectedRate ? formatRupiah(grandTotal) : "—"}
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
            disabled={submitting || !selectedRate || !selectedArea}
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

      {/* Payment instruction modal */}
      {showPaymentModal && orderResult && (
        <PaymentModal
          orderNumber={orderResult.orderNumber}
          total={orderResult.total}
          paymentMethod={orderResult.paymentMethod}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Payment Modal                                                     */
/* ────────────────────────────────────────────────────────────────── */

function PaymentModal({
  orderNumber,
  total,
  paymentMethod,
  onConfirm,
}: {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  onConfirm: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "fadeIn 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="bg-[color:var(--color-navy-900)] text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Instruksi Pembayaran</h3>
          </div>
          <p className="mt-1 text-sm text-white/70">
            Pesanan #{orderNumber}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Total */}
          <div className="text-center py-3 rounded-xl bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)]">
            <div className="text-xs text-[color:var(--color-muted)] uppercase tracking-wider">Total Pembayaran</div>
            <div className="text-2xl font-bold text-[color:var(--color-navy-900)] mt-1">
              {formatRupiah(total)}
            </div>
            <button
              type="button"
              onClick={() => copyText(String(total), "total")}
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-[color:var(--color-navy-900)] hover:underline"
            >
              {copied === "total" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied === "total" ? "Tersalin" : "Salin nominal"}
            </button>
          </div>

          {/* Payment instructions based on method */}
          {paymentMethod === "qris" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <QrCode className="h-4 w-4 text-[color:var(--color-navy-900)]" />
                Pembayaran QRIS
              </div>
              <div className="rounded-xl border border-[color:var(--color-line)] p-4 flex flex-col items-center gap-3">
                <div className="h-40 w-40 bg-[color:var(--color-cloud-100)] rounded-lg flex items-center justify-center border-2 border-dashed border-[color:var(--color-line)]">
                  <QrCode className="h-16 w-16 text-[color:var(--color-muted)]" />
                </div>
                <p className="text-xs text-[color:var(--color-muted)] text-center">
                  Scan QR code di atas dengan e-wallet atau m-banking Anda.
                  QR code berlaku selama 24 jam.
                </p>
              </div>
            </div>
          )}

          {paymentMethod === "va" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-[color:var(--color-navy-900)]" />
                Virtual Account
              </div>
              <div className="space-y-2">
                {[
                  { bank: "BCA", va: "8810" + orderNumber.replace(/\D/g, "").slice(0, 11) },
                  { bank: "Mandiri", va: "8920" + orderNumber.replace(/\D/g, "").slice(0, 11) },
                ].map((item) => (
                  <div key={item.bank} className="rounded-xl border border-[color:var(--color-line)] p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[color:var(--color-muted)]">{item.bank}</div>
                      <div className="font-mono font-semibold tracking-wider">{item.va}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(item.va, item.bank)}
                      className="btn btn-outline !px-3 !py-1.5 text-xs"
                    >
                      {copied === item.bank ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied === item.bank ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[color:var(--color-muted)]">
                Transfer sesuai nominal persis ke VA di atas. Pembayaran otomatis diverifikasi dalam 1–5 menit.
              </p>
            </div>
          )}

          {paymentMethod === "transfer" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-[color:var(--color-navy-900)]" />
                Transfer Bank
              </div>
              <div className="space-y-2">
                {BANK_ACCOUNTS.map((acc) => (
                  <div key={acc.bank} className="rounded-xl border border-[color:var(--color-line)] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[color:var(--color-muted)]">{acc.bank}</div>
                        <div className="font-mono font-semibold tracking-wider">{acc.number}</div>
                        <div className="text-xs text-[color:var(--color-muted)] mt-0.5">a.n. {acc.name}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(acc.number, acc.bank)}
                        className="btn btn-outline !px-3 !py-1.5 text-xs"
                      >
                        {copied === acc.bank ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied === acc.bank ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[color:var(--color-muted)]">
                Transfer <strong>sesuai nominal persis</strong> agar verifikasi otomatis.
                Konfirmasi pembayaran diproses dalam 1×24 jam kerja.
              </p>
            </div>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-primary w-full"
          >
            Sudah Bayar <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-[10px] text-center text-[color:var(--color-muted)]">
            Klik &quot;Sudah Bayar&quot; setelah Anda melakukan pembayaran.
            Anda juga bisa melihat instruksi ini di halaman detail pesanan.
          </p>
        </div>
      </div>
    </div>
  );
}
