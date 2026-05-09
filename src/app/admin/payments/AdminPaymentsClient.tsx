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

  const thStyle: React.CSSProperties = { padding: "10px 16px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, color: "var(--text-muted)", textAlign: "left" };
  const tdStyle: React.CSSProperties = { padding: "12px 16px", color: "var(--text)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Pending */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Menunggu Konfirmasi</h2>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {pending.length === 0 ? (
            <p style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Tidak ada konfirmasi pembayaran baru.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                    <th style={thStyle}>Pesanan</th>
                    <th style={thStyle}>Pembeli</th>
                    <th style={thStyle}>Info Transfer</th>
                    <th style={thStyle}>Nominal</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Bukti</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p.id} className="admin-row" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={tdStyle}>
                        <Link href={`/admin/orders/${p.orders?.id || ""}`} className="link-gold" style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>
                          {p.order_number}
                        </Link>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{formatDateTime(p.created_at)}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{p.orders?.customer_name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.orders?.customer_email}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700 }}>{p.bank_name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>a/n {p.account_name}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 700 }}>{formatRupiah(p.amount)}</span>
                        {p.amount !== p.orders?.total && (
                          <div style={{ fontSize: 11, color: "var(--error)", marginTop: 2 }}>Tagihan: {formatRupiah(p.orders?.total)}</div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {p.receipt_url ? (
                          <a href={p.receipt_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: 11, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <ExternalLink style={{ width: 12, height: 12 }} /> Lihat
                          </a>
                        ) : <span style={{ color: "var(--text-dim)", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <button
                            onClick={() => handleAction(p.id, p.order_number, "rejected")}
                            disabled={processing === p.id}
                            className="admin-btn-delete"
                            style={{ border: "1px solid var(--border)", padding: "4px 10px" }}
                            title="Tolak"
                          >
                            <XCircle style={{ width: 14, height: 14 }} /> Tolak
                          </button>
                          <button
                            onClick={() => handleAction(p.id, p.order_number, "approved")}
                            disabled={processing === p.id}
                            className="btn btn-primary"
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            title="Terima"
                          >
                            <CheckCircle2 style={{ width: 14, height: 14 }} /> Terima
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

      {/* History */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Riwayat Terakhir</h2>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {history.length === 0 ? (
            <p style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Belum ada riwayat diproses.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                    <th style={thStyle}>Pesanan</th>
                    <th style={thStyle}>Pembeli</th>
                    <th style={thStyle}>Nominal</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="admin-row" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{h.order_number}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{h.orders?.customer_name}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{formatRupiah(h.amount)}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", padding: "2px 8px",
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                          background: h.status === "approved" ? "rgba(126,179,232,0.1)" : h.status === "rejected" ? "rgba(239,68,68,0.1)" : "rgba(201,169,110,0.1)",
                          color: h.status === "approved" ? "var(--gold)" : h.status === "rejected" ? "var(--error)" : "var(--gold-dim)",
                          border: `1px solid ${h.status === "approved" ? "var(--gold-dim)" : h.status === "rejected" ? "var(--error)" : "var(--gold-dim)"}`,
                        }}>
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
