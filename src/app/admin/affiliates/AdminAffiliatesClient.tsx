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
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Pengajuan Pencairan Dana (Withdrawals)</h2>
        <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {pendingWithdrawals.length === 0 ? (
            <p style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Belum ada pengajuan pencairan dana.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, textAlign: "left", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg2)", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 20px", fontWeight: 500 }}>Tanggal</th>
                    <th style={{ padding: "12px 20px", fontWeight: 500 }}>Agen</th>
                    <th style={{ padding: "12px 20px", fontWeight: 500 }}>Rekening Tujuan</th>
                    <th style={{ padding: "12px 20px", fontWeight: 500 }}>Nominal</th>
                    <th style={{ padding: "12px 20px", fontWeight: 500, textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingWithdrawals.map((w) => (
                    <tr key={w.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 20px", color: "var(--text)" }}>{formatDate(w.created_at)}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{w.affiliate.full_name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{w.affiliate.email}</div>
                        <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>Kode: {w.affiliate.affiliate_code}</div>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ fontWeight: 700, color: "var(--text)" }}>{w.bank_name}</div>
                        <div style={{ color: "var(--text)" }}>{w.account_number}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{w.account_name}</div>
                      </td>
                      <td style={{ padding: "12px 20px", fontWeight: 700, color: "var(--gold)" }}>
                        {formatRupiah(w.amount)}
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <button
                            onClick={() => handleAction(w.id, "rejected")}
                            disabled={processing === w.id}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(255,80,80,0.1)", color: "#f87171", border: "none", cursor: "pointer" }}
                            title="Tolak"
                          >
                            <XCircle style={{ width: 16, height: 16 }} /> Tolak
                          </button>
                          <button
                            onClick={() => handleAction(w.id, "completed")}
                            disabled={processing === w.id}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(52,211,153,0.1)", color: "#34d399", border: "none", cursor: "pointer" }}
                            title="Tandai Sudah Transfer"
                          >
                            <CheckCircle2 style={{ width: 16, height: 16 }} /> Sudah Transfer
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
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Daftar Agen Affiliate</h2>
        <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {topAffiliates.length === 0 ? (
            <p style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Belum ada agen affiliate yang terdaftar.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, textAlign: "left", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg2)", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 20px", fontWeight: 500 }}>Agen</th>
                    <th style={{ padding: "12px 20px", fontWeight: 500 }}>Kode Referral</th>
                    <th style={{ padding: "12px 20px", fontWeight: 500, textAlign: "right" }}>Saldo Saat Ini</th>
                  </tr>
                </thead>
                <tbody>
                  {topAffiliates.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{a.full_name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.email}</div>
                      </td>
                      <td style={{ padding: "12px 20px", fontFamily: "monospace", color: "var(--gold)" }}>
                        {a.affiliate_code}
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", fontWeight: 600, color: "var(--text)" }}>
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
