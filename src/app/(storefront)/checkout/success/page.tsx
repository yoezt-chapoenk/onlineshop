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
      className="ml-2 inline-flex items-center gap-1 text-xs text-[color:var(--color-navy-400)] hover:text-[color:var(--color-navy-900)] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="card p-8 sm:p-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight">
          Terima kasih — pesanan Anda dikonfirmasi!
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Nomor pesanan{" "}
          <span className="font-semibold text-[color:var(--color-ink)]">
            {orderNumber}
          </span>
          . Instruksi pembayaran sudah kami kirim ke email Anda.
        </p>

        {order && (
          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-5 text-left">
            <div>
              <dt className="text-xs text-[color:var(--color-muted)]">Item</dt>
              <dd className="text-sm font-semibold mt-0.5">{order.itemCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--color-muted)]">Subtotal</dt>
              <dd className="text-sm font-semibold mt-0.5">{formatRupiah(order.subtotal)}</dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--color-muted)]">Pengiriman</dt>
              <dd className="text-sm font-semibold mt-0.5">
                {order.shipping}
                <span className="ml-1 font-normal text-[color:var(--color-muted)]">
                  ({formatRupiah(order.shippingCost)})
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--color-muted)]">Total</dt>
              <dd className="text-base font-bold text-[color:var(--color-navy-900)] mt-0.5">
                {formatRupiah(order.grandTotal)}
              </dd>
            </div>
          </dl>
        )}

        {/* Transfer Instructions */}
        {order?.payment === "transfer" && (
          <div className="mt-8 bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] rounded-xl p-5 text-left space-y-4">
            <h3 className="font-bold text-[color:var(--color-navy-900)] text-sm">
              Instruksi Pembayaran Transfer Bank
            </h3>
            <p className="text-sm text-[color:var(--color-muted)]">
              Harap transfer tepat sebesar{" "}
              <strong className="text-[color:var(--color-ink)]">
                {order ? formatRupiah(order.grandTotal) : "—"}
              </strong>{" "}
              ke salah satu rekening berikut:
            </p>

            {banks.length > 0 ? (
              <div className="space-y-3">
                {banks.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-[color:var(--color-line)] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)]">
                        {b.bank}
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-bold">{b.number}</p>
                      <p className="text-xs text-[color:var(--color-muted)]">a.n. {b.name}</p>
                    </div>
                    <CopyButton text={b.number} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[color:var(--color-muted)] italic">
                Rekening akan dikirim melalui email konfirmasi.
              </p>
            )}

            <p className="text-sm text-[color:var(--color-muted)]">
              Setelah transfer, wajib konfirmasi dengan mengirimkan bukti transfer melalui WhatsApp
              agar pesanan segera diproses.
            </p>
          </div>
        )}

        {/* QRIS Instructions */}
        {order?.payment === "qris" && (
          <div className="mt-8 bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] rounded-xl p-5 text-left space-y-4">
            <h3 className="font-bold text-[color:var(--color-navy-900)] text-sm">
              Instruksi Pembayaran QRIS
            </h3>
            {qrisUrl ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrisUrl}
                  alt="QRIS Payment Code"
                  className="w-48 h-48 object-contain rounded-xl border border-[color:var(--color-line)] bg-white p-2"
                />
                <p className="text-xs text-[color:var(--color-muted)] text-center">
                  Scan QR di atas untuk membayar sebesar{" "}
                  <strong className="text-[color:var(--color-ink)]">
                    {order ? formatRupiah(order.grandTotal) : "—"}
                  </strong>
                </p>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--color-muted)]">
                Silakan scan QR Code yang dikirimkan ke email Anda untuk membayar sebesar{" "}
                <strong className="text-[color:var(--color-ink)]">
                  {order ? formatRupiah(order.grandTotal) : "—"}
                </strong>.
              </p>
            )}
            <p className="text-sm text-[color:var(--color-muted)]">
              Setelah berhasil scan, kirimkan tangkapan layar (screenshot) bukti pembayaran melalui
              WhatsApp.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            Lanjut belanja <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={whatsappLink(
              `Halo Juragan Grosir, saya sudah melakukan pembayaran untuk order: ${orderNumber}. Berikut bukti transfernya:`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <MessageCircle className="h-4 w-4" /> Kirim Bukti Transfer
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
