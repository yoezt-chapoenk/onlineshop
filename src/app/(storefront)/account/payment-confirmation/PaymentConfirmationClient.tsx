"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Clock, XCircle, FileImage } from "lucide-react";
import { submitPaymentConfirmation } from "./actions";
import { formatRupiah } from "@/lib/format";

export default function PaymentConfirmationClient({ 
  initialOrderNumber, 
  pendingOrders,
  history 
}: { 
  initialOrderNumber: string, 
  pendingOrders: any[],
  history: any[]
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill amount if selecting from pending orders
  function handleOrderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setOrderNumber(val);
    const order = pendingOrders.find(o => o.order_number === val);
    if (order) {
      setAmount(order.total.toString());
    } else {
      setAmount("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (selected.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    
    setFile(selected);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber || !accountName || !bankName || !amount || !file) {
      setError("Mohon lengkapi semua data dan unggah bukti transfer");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("order_number", orderNumber);
    formData.append("account_name", accountName);
    formData.append("bank_name", bankName);
    formData.append("amount", amount);
    formData.append("receipt_image", file);
    
    const res = await submitPaymentConfirmation(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setOrderNumber("");
      setAccountName("");
      setBankName("");
      setAmount("");
      setFile(null);
      setPreview(null);
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div style={{ background: "rgba(52, 168, 83, 0.1)", border: "1px solid #34a853", padding: 32, textAlign: "center", borderRadius: 8 }}>
        <CheckCircle2 style={{ width: 64, height: 64, color: "#34a853", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Konfirmasi Berhasil Terkirim</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 14 }}>
          Terima kasih. Kami akan segera memverifikasi pembayaran Anda dan memproses pesanan.
        </p>
        <button onClick={() => setSuccess(false)} className="btn btn-primary">
          Kirim Konfirmasi Lain
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
      {/* Form Section */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
              Pilih Pesanan
            </label>
            {pendingOrders.length > 0 ? (
              <select 
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
                value={orderNumber}
                onChange={handleOrderChange}
              >
                <option value="">Pilih pesanan (Pending)</option>
                {pendingOrders.map(o => (
                  <option key={o.order_number} value={o.order_number} style={{ background: "var(--surface)", color: "var(--text)" }}>
                    {o.order_number} - {formatRupiah(o.total)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Contoh: JG-XXXXXX"
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", textTransform: "uppercase" }}
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
              />
            )}
          </div>
          
          <div>
            <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
              Transfer Dari Bank
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA, Mandiri, dll"
              style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
              value={bankName}
              onChange={e => setBankName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
              Atas Nama (Pengirim)
            </label>
            <input
              type="text"
              placeholder="Nama pemilik rekening pengirim"
              style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
              Nominal Transfer
            </label>
            <input
              type="text"
              placeholder="Contoh: 150000"
              style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
              Bukti Transfer (Foto/Screenshot)
            </label>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {!preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "1px dashed var(--border)", background: "var(--bg)", padding: 32, color: "var(--text-muted)", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg)"}
              >
                <UploadCloud style={{ width: 32, height: 32 }} />
                <span style={{ fontSize: 14 }}>Klik untuk unggah gambar</span>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Maksimal 5MB (JPG, PNG)</span>
              </button>
            ) : (
              <div style={{ position: "relative", border: "1px solid var(--border)", padding: 8, background: "var(--bg)" }}>
                <img src={preview} alt="Preview" style={{ width: "100%", height: 200, objectFit: "contain" }} />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{ position: "absolute", top: 16, right: 16, background: "var(--error)", color: "white", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer" }}
                >
                  <XCircle style={{ width: 20, height: 20 }} />
                </button>
              </div>
            )}
          </div>

          {error && <p style={{ color: "var(--error)", fontSize: 13 }}>{error}</p>}

          <button 
            type="submit" 
            disabled={submitting || !file} 
            className="btn btn-primary w-full"
            style={{ padding: "12px 24px", height: "auto" }}
          >
            {submitting ? "Mengunggah..." : "Kirim Konfirmasi"}
          </button>
        </form>
      </section>

      {/* History Section */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>Riwayat Konfirmasi Anda</h2>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {history.length === 0 ? (
            <p style={{ padding: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>Belum ada riwayat konfirmasi pembayaran.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {history.map((h, i) => (
                <div key={i} style={{ padding: 16, display: "flex", alignItems: "flex-start", gap: 16, borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    {h.status === "approved" ? <CheckCircle2 style={{ width: 20, height: 20, color: "#34a853" }} /> :
                     h.status === "rejected" ? <XCircle style={{ width: 20, height: 20, color: "var(--error)" }} /> :
                     <Clock style={{ width: 20, height: 20, color: "var(--gold)" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{h.order_number}</p>
                      <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, padding: "2px 6px", background: h.status === "approved" ? "rgba(52, 168, 83, 0.1)" : h.status === "rejected" ? "rgba(255, 59, 48, 0.1)" : "rgba(201, 169, 110, 0.1)", color: h.status === "approved" ? "#34a853" : h.status === "rejected" ? "var(--error)" : "var(--gold)" }}>{h.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(h.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    <p style={{ fontSize: 14, color: "var(--text)", marginTop: 4 }}>{h.bank_name} - {h.account_name}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <p style={{ fontWeight: 600, color: "var(--text)" }}>{formatRupiah(h.amount)}</p>
                      <a href={h.receipt_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--gold)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                        <FileImage style={{ width: 12, height: 12 }} /> Lihat Resi
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
