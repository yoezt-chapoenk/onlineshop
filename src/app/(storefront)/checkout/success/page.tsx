"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
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

function SuccessInner() {
  const params = useSearchParams();
  const orderNumberParam = params.get("order");
  const [order, setOrder] = useState<OrderInfo | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("jg.lastOrder");
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrder(JSON.parse(raw) as OrderInfo);
      }
    } catch {}
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

        {order?.payment === "transfer" && (
          <div className="mt-8 bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] rounded-xl p-5 text-left text-sm space-y-2">
            <h3 className="font-bold text-[color:var(--color-navy-900)]">Instruksi Pembayaran Manual:</h3>
            <p className="text-[color:var(--color-muted)]">
              Harap transfer tepat sebesar <strong className="text-[color:var(--color-ink)]">{formatRupiah(order.grandTotal)}</strong> ke rekening yang tertera pada email tagihan Anda.
            </p>
            <p className="text-[color:var(--color-muted)]">
              Setelah transfer, wajib melakukan konfirmasi dengan mengirimkan bukti transfer melalui WhatsApp agar pesanan segera diproses.
            </p>
          </div>
        )}

        {order?.payment === "qris" && (
          <div className="mt-8 bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] rounded-xl p-5 text-left text-sm space-y-2">
            <h3 className="font-bold text-[color:var(--color-navy-900)]">Instruksi Pembayaran QRIS:</h3>
            <p className="text-[color:var(--color-muted)]">
              Silakan scan QR Code yang dikirimkan ke email Anda untuk membayar sebesar <strong className="text-[color:var(--color-ink)]">{formatRupiah(order.grandTotal)}</strong>.
            </p>
            <p className="text-[color:var(--color-muted)]">
              Setelah berhasil scan, kirimkan tangkapan layar (screenshot) bukti pembayaran melalui WhatsApp.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            Lanjut belanja <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={whatsappLink(
              `Halo Juragan Grosir, saya butuh bantuan dengan order: ${orderNumber}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <MessageCircle className="h-4 w-4" /> Dukungan WhatsApp
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
