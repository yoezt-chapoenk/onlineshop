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
    const amount = parseInt(withdrawAmount.replace(/\\D/g, ""));
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
    <div className="space-y-8">
      {!profile.affiliate_code ? (
        <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-6">
          <h2 className="text-lg font-bold mb-2">Mulai Program Affiliate</h2>
          <p className="text-[color:var(--color-muted)] mb-4 text-sm">
            Buat kode referral unik Anda. Sebarkan link Anda dan dapatkan komisi dari setiap pembeli yang berbelanja menggunakan link tersebut.
          </p>
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              placeholder="Contoh: AGENBUDI"
              className="input flex-1 uppercase"
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              maxLength={15}
            />
            <button type="submit" disabled={generating || !code} className="btn btn-primary whitespace-nowrap">
              {generating ? "Membuat..." : "Buat Kode"}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard Stat */}
          <section className="rounded-2xl bg-gradient-to-br from-[color:var(--color-navy-900)] to-blue-900 text-white p-6 relative overflow-hidden">
            <h2 className="text-sm font-medium text-white/80 uppercase tracking-widest mb-1">Saldo Komisi Aktif</h2>
            <div className="text-4xl font-bold mb-6">{formatRupiah(profile.balance)}</div>
            
            <div className="space-y-2 relative z-10">
              <label className="text-xs text-white/70">Link Referral Anda</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={affiliateLink} 
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm flex-1 outline-none truncate"
                />
                <button onClick={handleCopy} className="btn bg-white/20 hover:bg-white/30 text-white border-0 !px-3">
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </section>

          {/* Withdraw Form */}
          <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-6">
            <h2 className="text-lg font-bold mb-4">Tarik Saldo</h2>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <input
                type="number"
                placeholder="Nominal (Min. Rp 50.000)"
                className="input text-sm"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama Bank (BCA, dll)"
                  className="input text-sm"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Atas Nama"
                  className="input text-sm"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Nomor Rekening"
                className="input text-sm"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\\D/g, ""))}
              />
              {withdrawError && <p className="text-red-500 text-xs">{withdrawError}</p>}
              <button 
                type="submit" 
                disabled={withdrawing || profile.balance < 50000} 
                className="btn btn-primary w-full"
              >
                {withdrawing ? "Memproses..." : "Ajukan Pencairan"}
              </button>
            </form>
          </section>
        </div>
      )}

      {profile.affiliate_code && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[color:var(--color-line)]">
              <h2 className="font-bold">Riwayat Komisi</h2>
            </div>
            <div className="p-0">
              {commissions.length === 0 ? (
                <p className="p-5 text-center text-sm text-[color:var(--color-muted)]">Belum ada komisi masuk.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase text-[color:var(--color-muted)]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Tanggal</th>
                      <th className="px-5 py-3 font-medium">Order</th>
                      <th className="px-5 py-3 font-medium text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--color-line)]">
                    {commissions.map((c, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3">{formatDate(c.created_at)}</td>
                        <td className="px-5 py-3 text-[color:var(--color-muted)]">#{c.orders?.order_number}</td>
                        <td className="px-5 py-3 text-right font-medium text-[color:var(--color-success)]">
                          +{formatRupiah(c.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[color:var(--color-line)]">
              <h2 className="font-bold">Riwayat Penarikan</h2>
            </div>
            <div className="p-0">
              {withdrawals.length === 0 ? (
                <p className="p-5 text-center text-sm text-[color:var(--color-muted)]">Belum ada riwayat penarikan.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase text-[color:var(--color-muted)]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Tanggal</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--color-line)]">
                    {withdrawals.map((w, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3">{formatDate(w.created_at)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            w.status === "completed" ? "bg-green-100 text-green-800" :
                            w.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-red-600">
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
