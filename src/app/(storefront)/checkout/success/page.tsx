"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, ArrowRight, Copy, Check } from "lucide-react";
import { Suspense } from "react";
import { formatRupiah } from "@/lib/format";
import { whatsappLink } from "@/lib/constants";

interface OrderInfo {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  shipping: string;
  payment: string;
  itemCount: number;
}

interface BankAccount {
  bank: string;
  number: string;
  name: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
    >
      {copied ? <Check style={{ width: 14, height: 14, color: "var(--success)" }} /> : <Copy style={{ width: 14, height: 14 }} />}
      {copied ? "Disalin" : "Salin"}
    </button>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const orderNumberParam = params.get("order");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("jg.lastOrder");
      if (raw) {
        setOrder(JSON.parse(raw) as OrderInfo);
      }
    } catch {}

    // Fetch payment config
    fetch("/api/payment-config")
      .then((r) => r.json())
      .then(({ banks, qrisUrl }) => {
        setBanks(banks ?? []);
        setQrisUrl(qrisUrl ?? null);
      })
      .catch(() => {});
  }, []);

  const orderNumber = order?.orderNumber ?? orderNumberParam ?? "—";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(52, 168, 83, 0.1)", color: "#34a853", marginBottom: 20 }}>
          <CheckCircle2 style={{ width: 32, height: 32 }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 8 }}>
          Terima kasih — pesanan Anda dikonfirmasi!
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>
          Nomor pesanan{" "}
          <span style={{ fontWeight: 600, color: "var(--text)" }}>
            {orderNumber}
          </span>
          . Instruksi pembayaran sudah kami kirim ke email Anda.
        </p>

        {order && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 20, textAlign: "left", marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>Item</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{order.itemCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>Subtotal</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{formatRupiah(order.subtotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>Pengiriman</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                {order.shipping}
                <span style={{ marginLeft: 4, fontWeight: 400, color: "var(--text-muted)" }}>
                  ({formatRupiah(order.shippingCost)})
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)" }}>
                {formatRupiah(order.grandTotal)}
              </div>
            </div>
          </div>
        )}

        {/* Transfer Instructions */}
        {order?.payment === "transfer" && (
          <div style={{ marginTop: 32, background: "var(--bg2)", border: "1px solid var(--border)", padding: 24, textAlign: "left" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
              Instruksi Pembayaran Transfer Bank
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
              Harap transfer tepat sebesar{" "}
              <strong style={{ color: "var(--gold)" }}>
                {order ? formatRupiah(order.grandTotal) : "—"}
              </strong>{" "}
              ke salah satu rekening berikut:
            </p>

            {banks.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {banks.map((b, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", background: "var(--surface)", padding: "12px 16px" }}
                  >
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 2 }}>
                        {b.bank}
                      </p>
                      <p style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{b.number}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>a.n. {b.name}</p>
                    </div>
                    <CopyButton text={b.number} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 16 }}>
                Rekening akan dikirim melalui email konfirmasi.
              </p>
            )}

            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Setelah transfer, wajib konfirmasi dengan mengirimkan bukti transfer melalui WhatsApp
              agar pesanan segera diproses.
            </p>
          </div>
        )}

        {/* QRIS Instructions */}
        {order?.payment === "qris" && (
          <div style={{ marginTop: 32, background: "var(--bg2)", border: "1px solid var(--border)", padding: 24, textAlign: "left" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
              Instruksi Pembayaran QRIS
            </h3>
            {qrisUrl ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrisUrl}
                  alt="QRIS Payment Code"
                  style={{ width: 192, height: 192, objectFit: "contain", border: "1px solid var(--border)", background: "#fff", padding: 8 }}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                  Scan QR di atas untuk membayar sebesar{" "}
                  <strong style={{ color: "var(--gold)" }}>
                    {order ? formatRupiah(order.grandTotal) : "—"}
                  </strong>
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
                Silakan scan QR Code yang dikirimkan ke email Anda untuk membayar sebesar{" "}
                <strong style={{ color: "var(--gold)" }}>
                  {order ? formatRupiah(order.grandTotal) : "—"}
                </strong>.
              </p>
            )}
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Setelah berhasil scan, kirimkan tangkapan layar (screenshot) bukti pembayaran melalui
              WhatsApp.
            </p>
          </div>
        )}

        <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <Link href="/shop" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Lanjut belanja <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <a
            href={whatsappLink(
              `Halo Juragan Grosir, saya sudah melakukan pembayaran untuk order: ${orderNumber}. Berikut bukti transfernya:`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} /> Kirim Bukti Transfer
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
