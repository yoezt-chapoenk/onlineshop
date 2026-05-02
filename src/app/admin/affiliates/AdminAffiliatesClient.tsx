"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { formatDate } from "@/lib/admin/format";
import { processWithdrawal } from "./actions";

export default function AdminAffiliatesClient({ pendingWithdrawals, topAffiliates }: { pendingWithdrawals: any[], topAffiliates: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(id: string, action: "completed" | "rejected") {
    if (action === "completed" && !confirm("Pastikan Anda sudah mentransfer dana sebelum menekan tombol ini. Lanjutkan?")) return;
    if (action === "rejected" && !confirm("Tolak pencairan dana ini? Saldo akan dikembalikan ke agen.")) return;
    
    setProcessing(id);
    await processWithdrawal(id, action);
    setProcessing(null);
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-bold mb-4">Pengajuan Pencairan Dana (Withdrawals)</h2>
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
          {pendingWithdrawals.length === 0 ? (
            <p className="p-8 text-center text-[color:var(--color-muted)]">Belum ada pengajuan pencairan dana.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase text-[color:var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Tanggal</th>
                    <th className="px-5 py-3 font-medium">Agen</th>
                    <th className="px-5 py-3 font-medium">Rekening Tujuan</th>
                    <th className="px-5 py-3 font-medium">Nominal</th>
                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-line)]">
                  {pendingWithdrawals.map((w) => (
                    <tr key={w.id}>
                      <td className="px-5 py-3">{formatDate(w.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{w.affiliate.full_name}</div>
                        <div className="text-xs text-[color:var(--color-muted)]">{w.affiliate.email}</div>
                        <div className="text-xs text-[color:var(--color-navy-700)] mt-0.5">Kode: {w.affiliate.affiliate_code}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold">{w.bank_name}</div>
                        <div>{w.account_number}</div>
                        <div className="text-xs text-[color:var(--color-muted)]">{w.account_name}</div>
                      </td>
                      <td className="px-5 py-3 font-bold text-red-600">
                        {formatRupiah(w.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(w.id, "rejected")}
                            disabled={processing === w.id}
                            className="btn bg-red-50 text-red-600 hover:bg-red-100 border-0 !px-3"
                            title="Tolak"
                          >
                            <XCircle className="w-4 h-4" /> Tolak
                          </button>
                          <button
                            onClick={() => handleAction(w.id, "completed")}
                            disabled={processing === w.id}
                            className="btn bg-green-50 text-green-600 hover:bg-green-100 border-0 !px-3"
                            title="Tandai Sudah Transfer"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Sudah Transfer
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
        <h2 className="text-lg font-bold mb-4">Daftar Agen Affiliate</h2>
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
          {topAffiliates.length === 0 ? (
            <p className="p-8 text-center text-[color:var(--color-muted)]">Belum ada agen affiliate yang terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase text-[color:var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Agen</th>
                    <th className="px-5 py-3 font-medium">Kode Referral</th>
                    <th className="px-5 py-3 font-medium text-right">Saldo Saat Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-line)]">
                  {topAffiliates.map((a) => (
                    <tr key={a.id}>
                      <td className="px-5 py-3">
                        <div className="font-medium">{a.full_name}</div>
                        <div className="text-xs text-[color:var(--color-muted)]">{a.email}</div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[color:var(--color-navy-700)]">
                        {a.affiliate_code}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatRupiah(a.balance)}
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
