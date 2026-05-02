"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/admin/format";
import { formatRupiah } from "@/lib/format";
import { processPaymentConfirmation } from "./actions";
import Link from "next/link";

export default function AdminPaymentsClient({ pending, history }: { pending: any[], history: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(id: string, orderNumber: string, action: "approved" | "rejected") {
    if (action === "approved" && !confirm(`Terima pembayaran ini dan ubah status pesanan ${orderNumber} menjadi PAID?`)) return;
    if (action === "rejected" && !confirm("Tolak bukti transfer ini?")) return;
    
    setProcessing(id);
    await processPaymentConfirmation(id, orderNumber, action);
    setProcessing(null);
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-bold mb-4">Menunggu Konfirmasi</h2>
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
          {pending.length === 0 ? (
            <p className="p-8 text-center text-[color:var(--color-muted)]">Tidak ada konfirmasi pembayaran baru.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase text-[color:var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Pesanan</th>
                    <th className="px-5 py-3 font-medium">Pembeli</th>
                    <th className="px-5 py-3 font-medium">Info Transfer</th>
                    <th className="px-5 py-3 font-medium">Nominal</th>
                    <th className="px-5 py-3 font-medium text-center">Bukti</th>
                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-line)]">
                  {pending.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${p.orders?.id || ""}`} className="font-bold text-blue-600 hover:underline">
                          {p.order_number}
                        </Link>
                        <div className="text-xs text-[color:var(--color-muted)] mt-1">{formatDateTime(p.created_at)}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.orders?.customer_name}</div>
                        <div className="text-xs text-[color:var(--color-muted)]">{p.orders?.customer_email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold">{p.bank_name}</div>
                        <div className="text-xs text-[color:var(--color-muted)]">a/n {p.account_name}</div>
                      </td>
                      <td className="px-5 py-3 font-bold text-[color:var(--color-navy-900)]">
                        {formatRupiah(p.amount)}
                        {p.amount !== p.orders?.total && (
                          <div className="text-xs text-red-500 font-normal">Tagihan: {formatRupiah(p.orders?.total)}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <a href={p.receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                          <ExternalLink className="w-3 h-3" /> Lihat
                        </a>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(p.id, p.order_number, "rejected")}
                            disabled={processing === p.id}
                            className="btn bg-red-50 text-red-600 hover:bg-red-100 border-0 !px-3"
                            title="Tolak"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(p.id, p.order_number, "approved")}
                            disabled={processing === p.id}
                            className="btn bg-green-50 text-green-600 hover:bg-green-100 border-0 !px-3"
                            title="Terima (Ubah ke PAID)"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Terima
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Riwayat Terakhir</h2>
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
          {history.length === 0 ? (
            <p className="p-8 text-center text-[color:var(--color-muted)]">Belum ada riwayat diproses.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase text-[color:var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Pesanan</th>
                    <th className="px-5 py-3 font-medium">Pembeli</th>
                    <th className="px-5 py-3 font-medium">Nominal</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-line)]">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-5 py-3">
                        <div className="font-bold">{h.order_number}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{h.orders?.customer_name}</div>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatRupiah(h.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          h.status === "approved" ? "bg-green-100 text-green-800" :
                          h.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
