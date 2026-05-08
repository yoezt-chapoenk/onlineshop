"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Copy, Check, QrCode, Building2 } from "lucide-react";
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
import { getSavedAddress } from "./actions";

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

interface PaymentConfig {
  banks: { bank: string; number: string; name: string }[];
  qrisUrl: string | null;
}

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

  // Saved Address functionality
  const [addressMode, setAddressMode] = useState<"saved" | "new" | null>(null);
  const [savedAddress, setSavedAddress] = useState<any>(null);

  // Shipping
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const shippingRateId = selectedRate
    ? `${selectedRate.courierCode}::${selectedRate.courierServiceCode}`
    : null;

  // Payment
  const [paymentId, setPaymentId] = useState<string>(PAYMENT_METHODS[0].id);

  // Dynamic payment config from admin settings
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ banks: [], qrisUrl: null });
  useEffect(() => {
    fetch("/api/payment-config")
      .then((r) => r.json())
      .then((d: PaymentConfig) => setPaymentConfig(d))
      .catch(() => {});
      
    // Fetch saved address
    getSavedAddress().then(addr => {
      if (addr) {
        setSavedAddress(addr);
        setAddressMode("saved");
        setSelectedArea({
          id: "saved-area",
          label: `${addr.district}, ${addr.city}, ${addr.province}`,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          postalCode: addr.postalCode
        });
      } else {
        setAddressMode("new");
      }
    });
  }, []);

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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PageHeader title="Checkout" breadcrumbs={[{ label: "Checkout" }]} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px", fontSize: 14, color: "var(--text-muted)" }}>
          Memuat…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PageHeader
          title="Checkout"
          description="Keranjang Anda kosong — tambahkan produk sebelum checkout."
          breadcrumbs={[{ label: "Checkout" }]}
        />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <Link href="/shop" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Lihat Produk <ArrowRight style={{ width: 16, height: 16 }} />
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
    
    // Determine customer and address based on addressMode
    let finalCustomer;
    let finalAddress;

    if (addressMode === "saved" && savedAddress) {
      finalCustomer = {
        fullName: savedAddress.fullName,
        phone: savedAddress.phone,
        email: savedAddress.email,
      };
      finalAddress = {
        province: savedAddress.province,
        city: savedAddress.city,
        district: savedAddress.district,
        postalCode: savedAddress.postalCode,
        address: savedAddress.address,
        notes: String(data.get("notes") ?? "") || null,
      };
    } else {
      finalCustomer = {
        fullName: String(data.get("full_name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
      };
      finalAddress = {
        province: selectedArea.province,
        city: selectedArea.city,
        district: selectedArea.district,
        postalCode: selectedArea.postalCode,
        address: String(data.get("address") ?? ""),
        notes: String(data.get("notes") ?? "") || null,
      };
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          customer: finalCustomer,
          address: finalAddress,
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
    <div style={{ display: "flex", flexDirection: "column" }}>
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
        style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Saved Address Card OR Manual Input Forms */}
          {addressMode === "saved" && savedAddress ? (
            <section style={{ background: "var(--surface)", border: "1px solid var(--gold)", padding: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Check style={{ width: 16, height: 16, color: "var(--success)" }} />
                    Alamat Pengiriman Utama
                  </h2>
                  <div style={{ marginTop: 16, fontSize: 14, color: "var(--text)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <p style={{ fontWeight: 600 }}>{savedAddress.fullName}</p>
                    <p style={{ color: "var(--text-muted)" }}>{savedAddress.phone} • {savedAddress.email}</p>
                    <p style={{ paddingTop: 8, color: "var(--text-muted)" }}>
                      {savedAddress.address}<br />
                      {savedAddress.district}, {savedAddress.city}, {savedAddress.province} {savedAddress.postalCode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressMode("new")}
                  className="btn btn-outline"
                  style={{ flexShrink: 0, padding: "8px 16px", fontSize: 12 }}
                >
                  Ganti Alamat
                </button>
              </div>
            </section>
          ) : (
            <>
              {savedAddress && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -16 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressMode("saved");
                      setSelectedArea({
                        id: "saved-area",
                        label: `${savedAddress.district}, ${savedAddress.city}, ${savedAddress.province}`,
                        province: savedAddress.province,
                        city: savedAddress.city,
                        district: savedAddress.district,
                        postalCode: savedAddress.postalCode
                      });
                    }}
                    className="text-sm text-[color:var(--color-navy-600)] hover:underline font-medium"
                    style={{ fontSize: 13, color: "var(--gold)", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    Batal / Gunakan Alamat Tersimpan
                  </button>
                </div>
              )}
              {/* Customer Info */}
              <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Informasi Pelanggan</h2>
                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="full_name">
                      Nama lengkap
                    </label>
                    <input
                      id="full_name"
                      name="full_name"
                      required
                      style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="phone">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      required
                      type="tel"
                      style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      required
                      type="email"
                      style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Alamat Pengiriman</h2>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <AreaSearch
                    onSelect={handleAreaSelect}
                    disabled={submitting}
                  />
                  {selectedArea && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      <div>
                        <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Provinsi</span>
                        <div style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", fontSize: 14 }}>
                          {selectedArea.province}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Kota / Kabupaten</span>
                        <div style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", fontSize: 14 }}>
                          {selectedArea.city}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Kode Pos</span>
                        <div style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", fontSize: 14 }}>
                          {selectedArea.postalCode}
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="address">
                      Alamat lengkap
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", minHeight: 90, resize: "vertical" }}
                      placeholder="Jl. Contoh No. 123, Komplek …"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="notes">
                      Catatan (opsional)
                    </label>
                    <input
                      id="notes"
                      name="notes"
                      style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                      placeholder="Titip ke security depan rumah"
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Shipping Method — live rates */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Metode Pengiriman</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
              Tarif kurir real-time dari Biteship berdasarkan tujuan dan total
              berat ({(totals.weightGram / 1000).toFixed(2)} kg).
            </p>
            <div style={{ marginTop: 24 }}>
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
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Metode Pembayaran</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
              Pemrosesan pembayaran aman.
            </p>
            <ul style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
              {PAYMENT_METHODS.map((m) => {
                const selected = paymentId === m.id;
                return (
                  <li key={m.id}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        border: "1px solid",
                        borderColor: selected ? "var(--gold)" : "var(--border)",
                        background: selected ? "var(--bg2)" : "transparent",
                        padding: 16,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--text-muted)"; }}
                      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={selected}
                        disabled={submitting}
                        onChange={() => setPaymentId(m.id)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--gold)" }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
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
        <aside style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32, height: "fit-content", position: "sticky", top: 80 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Ringkasan Pesanan</h2>
          <ul style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: 320, overflowY: "auto", listStyle: "none", padding: 0 }}>
            {totals.lineItems.map(({ item, pricing }) => (
              <li
                key={item.lineId}
                style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, fontSize: 14 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  {item.variantLabel ? (
                    <div style={{ fontSize: 12, color: "var(--gold)" }}>
                      {item.variantLabel}
                    </div>
                  ) : null}
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {item.quantity} × {formatRupiah(pricing.unitPrice)}
                    {pricing.tierLabel ? ` · ${pricing.tierLabel}` : ""}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>
                  {formatRupiah(pricing.subtotal)}
                </div>
              </li>
            ))}
          </ul>
          <dl style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--text-muted)" }}>Subtotal</dt>
              <dd style={{ fontWeight: 600, color: "var(--text)" }}>
                {formatRupiah(totals.subtotal)}
              </dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--text-muted)" }}>
                Ongkos kirim
                {selectedRate
                  ? ` (${selectedRate.courierName.toUpperCase() === "JNT" ? "J&T" : selectedRate.courierName.toUpperCase() === "SENTRALCARGO" ? "Central Cargo" : selectedRate.courierName.toUpperCase()} ${selectedRate.courierServiceName})`
                  : ""}
              </dt>
              <dd style={{ fontWeight: 600, color: "var(--text)" }}>
                {selectedRate ? formatRupiah(shippingCost) : "—"}
              </dd>
            </div>
          </dl>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>Total</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-display)" }}>
              {selectedRate ? formatRupiah(grandTotal) : "—"}
            </span>
          </div>
          {error && (
            <p
              role="alert"
              style={{ marginTop: 24, fontSize: 14, color: "var(--error)" }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !selectedRate || !selectedArea}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 32, display: "flex", justifyContent: "center", gap: 8 }}
          >
            {submitting ? "Membuat pesanan…" : "Buat pesanan & bayar"}
            {!submitting && <ArrowRight style={{ width: 16, height: 16 }} />}
          </button>
          <div style={{ marginTop: 24, display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
            <ShieldCheck style={{ width: 16, height: 16, flexShrink: 0, color: "var(--success)" }} />
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
          banks={paymentConfig.banks}
          qrisUrl={paymentConfig.qrisUrl}
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
  banks,
  qrisUrl,
  onConfirm,
}: {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  banks: { bank: string; number: string; name: string }[];
  qrisUrl: string | null;
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
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyItems: "center", padding: 16 }}>
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} />

      {/* Modal */}
      <div
        style={{ position: "relative", width: "100%", maxWidth: 448, margin: "auto", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", maxHeight: "90vh", overflowY: "auto", animation: "fadeIn 0.3s ease-out" }}
      >
        {/* Header */}
        <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "20px 24px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Instruksi Pembayaran</h3>
          </div>
          <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-muted)" }}>
            Pesanan #{orderNumber}
          </p>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Total */}
          <div style={{ textAlign: "center", padding: 24, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>Total Pembayaran</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)", marginTop: 8, fontFamily: "var(--font-display)" }}>
              {formatRupiah(total)}
            </div>
            <button
              type="button"
              onClick={() => copyText(String(total), "total")}
              style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              {copied === "total" ? <Check style={{ width: 14, height: 14, color: "var(--success)" }} /> : <Copy style={{ width: 14, height: 14 }} />}
              {copied === "total" ? "Tersalin" : "Salin nominal"}
            </button>
          </div>

          {/* QRIS — dynamic image from admin settings */}
          {paymentMethod === "qris" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                <QrCode style={{ width: 16, height: 16, color: "var(--gold)" }} />
                Pembayaran QRIS
              </div>
              <div style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                {qrisUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrisUrl}
                    alt="QRIS"
                    style={{ width: 192, height: 192, objectFit: "contain", border: "1px solid var(--border)", background: "#fff", padding: 8 }}
                  />
                ) : (
                  <div style={{ width: 160, height: 160, background: "var(--bg2)", border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode style={{ width: 64, height: 64, color: "var(--text-muted)" }} />
                  </div>
                )}
                <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                  Scan QR code di atas dengan e-wallet atau m-banking Anda.
                  QR code berlaku selama 24 jam.
                </p>
              </div>
            </div>
          )}

          {/* Transfer Bank — dynamic bank list from admin settings */}
          {paymentMethod === "transfer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                <Building2 style={{ width: 16, height: 16, color: "var(--gold)" }} />
                Transfer Bank
              </div>
              {banks.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {banks.map((acc, i) => (
                    <div key={`${acc.bank}-${i}`} style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>{acc.bank}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{acc.number}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>a.n. {acc.name}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(acc.number, `bank-${i}`)}
                          className="btn btn-outline"
                          style={{ padding: "8px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
                        >
                          {copied === `bank-${i}` ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                          {copied === `bank-${i}` ? "Tersalin" : "Salin"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "var(--text-muted)", padding: "16px 0", textAlign: "center", border: "1px dashed var(--border)" }}>
                  Rekening bank belum dikonfigurasi. Hubungi admin.
                </p>
              )}
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Transfer <strong>sesuai nominal persis</strong> agar verifikasi otomatis.
                Konfirmasi pembayaran diproses dalam 1×24 jam kerja.
              </p>
            </div>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-primary"
            style={{ width: "100%", display: "flex", justifyContent: "center", gap: 8 }}
          >
            Sudah Bayar <ArrowRight style={{ width: 16, height: 16 }} />
          </button>

          <p style={{ fontSize: 11, textAlign: "center", color: "var(--text-muted)", marginTop: -8 }}>
            Klik &quot;Sudah Bayar&quot; setelah Anda melakukan pembayaran.
            Anda juga bisa melihat instruksi ini di halaman detail pesanan.
          </p>
        </div>
      </div>
    </div>
  );
}
