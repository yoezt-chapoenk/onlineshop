"use client";

import { useState, useEffect } from "react";
import { Copy, Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { generateAffiliateCode, requestWithdrawal } from "./actions";
import { formatRupiah } from "@/lib/format";
import { formatDate } from "@/lib/admin/format";

export default function AffiliateDashboardClient({ profile, commissions, withdrawals, siteUrl }: { profile: any, commissions: any[], withdrawals: any[], siteUrl: string }) {
  const [code, setCode] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(siteUrl);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const affiliateLink = profile.affiliate_code ? `${origin}?ref=${profile.affiliate_code}` : "";

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setGenerating(true);
    setError(null);
    const res = await generateAffiliateCode(code.trim().toUpperCase());
    if (res.error) setError(res.error);
    setGenerating(false);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(withdrawAmount.replace(/\D/g, ""));
    if (!amount || amount < 50000) {
      setWithdrawError("Minimal penarikan adalah Rp 50.000");
      return;
    }
    if (amount > profile.balance) {
      setWithdrawError("Saldo tidak mencukupi");
      return;
    }
    if (!bankName || !accountName || !accountNumber) {
      setWithdrawError("Lengkapi data rekening");
      return;
    }
    setWithdrawing(true);
    setWithdrawError(null);
    const res = await requestWithdrawal(amount, bankName, accountName, accountNumber);
    if (res.error) setWithdrawError(res.error);
    else {
      setWithdrawAmount("");
      setBankName("");
      setAccountName("");
      setAccountNumber("");
    }
    setWithdrawing(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {!profile.affiliate_code ? (
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32, maxWidth: 600 }}>
          <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", marginBottom: 8 }}>Mulai Program Affiliate</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
            Buat kode referral unik Anda. Sebarkan link Anda dan dapatkan komisi dari setiap pembeli yang berbelanja menggunakan link tersebut.
          </p>
          <form onSubmit={handleGenerate} style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="Contoh: AGENBUDI"
              style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", textTransform: "uppercase" }}
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              maxLength={15}
            />
            <button type="submit" disabled={generating || !code} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
              {generating ? "Membuat..." : "Buat Kode"}
            </button>
          </form>
          {error && <p style={{ color: "var(--error)", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </section>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Dashboard Stat */}
          <section style={{ background: "var(--gold)", color: "var(--bg)", padding: 32, position: "relative", overflow: "hidden" }}>
            <h2 style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--bg)", opacity: 0.8, marginBottom: 8 }}>Saldo Komisi Aktif</h2>
            <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "var(--font-display)", marginBottom: 32 }}>{formatRupiah(profile.balance)}</div>
            
            <div style={{ position: "relative", zIndex: 10 }}>
              <label style={{ fontSize: 12, color: "var(--bg)", opacity: 0.8, marginBottom: 8, display: "block" }}>Link Referral Anda</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input 
                  readOnly 
                  value={affiliateLink} 
                  style={{ flex: 1, background: "rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.2)", color: "var(--bg)", padding: "8px 12px", outline: "none", fontSize: 13, fontFamily: "var(--font-sans)" }}
                />
                <button type="button" onClick={handleCopy} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 16px", background: "var(--bg)", color: "var(--text)", border: "none", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
                  {copied ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
          </section>

          {/* Withdraw Form */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>Tarik Saldo</h2>
            <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="number"
                placeholder="Nominal (Min. Rp 50.000)"
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Nama Bank (BCA, dll)"
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Atas Nama"
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Nomor Rekening"
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              />
              {withdrawError && <p style={{ color: "var(--error)", fontSize: 13 }}>{withdrawError}</p>}
              <button 
                type="submit" 
                disabled={withdrawing || profile.balance < 50000} 
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 8 }}
              >
                {withdrawing ? "Memproses..." : "Ajukan Pencairan"}
              </button>
            </form>
          </section>
        </div>
      )}

      {profile.affiliate_code && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Riwayat Komisi</h2>
            </div>
            <div>
              {commissions.length === 0 ? (
                <p style={{ padding: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>Belum ada komisi masuk.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead style={{ background: "var(--bg2)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                    <tr>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "12px 24px" }}>Tanggal</th>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "12px 24px" }}>Order</th>
                      <th style={{ textAlign: "right", fontWeight: 500, padding: "12px 24px" }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 24px", color: "var(--text)" }}>{formatDate(c.created_at)}</td>
                        <td style={{ padding: "12px 24px", color: "var(--text-muted)" }}>#{c.orders?.order_number}</td>
                        <td style={{ padding: "12px 24px", textAlign: "right", fontWeight: 600, color: "var(--gold)" }}>
                          +{formatRupiah(c.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Riwayat Penarikan</h2>
            </div>
            <div>
              {withdrawals.length === 0 ? (
                <p style={{ padding: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>Belum ada riwayat penarikan.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead style={{ background: "var(--bg2)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                    <tr>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "12px 24px" }}>Tanggal</th>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "12px 24px" }}>Status</th>
                      <th style={{ textAlign: "right", fontWeight: 500, padding: "12px 24px" }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 24px", color: "var(--text)" }}>{formatDate(w.created_at)}</td>
                        <td style={{ padding: "12px 24px" }}>
                          <span style={{ display: "inline-block", fontSize: 10, textTransform: "uppercase", fontWeight: 600, padding: "2px 6px", background: w.status === "completed" ? "rgba(52, 168, 83, 0.1)" : w.status === "rejected" ? "rgba(255, 59, 48, 0.1)" : "rgba(201, 169, 110, 0.1)", color: w.status === "completed" ? "#34a853" : w.status === "rejected" ? "var(--error)" : "var(--gold)" }}>
                            {w.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 24px", textAlign: "right", fontWeight: 600, color: "var(--error)" }}>
                          -{formatRupiah(w.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
