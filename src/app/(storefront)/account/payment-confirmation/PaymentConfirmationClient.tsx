"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Clock, XCircle, FileImage } from "lucide-react";
import { submitPaymentConfirmation } from "./actions";
import { formatRupiah, formatDate } from "@/lib/format";

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
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-green-900 mb-2">Konfirmasi Berhasil Terkirim</h2>
        <p className="text-green-800 mb-6">
          Terima kasih. Kami akan segera memverifikasi pembayaran Anda dan memproses pesanan.
        </p>
        <button onClick={() => setSuccess(false)} className="btn bg-green-600 text-white hover:bg-green-700">
          Kirim Konfirmasi Lain
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Form Section */}
      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-navy-900)] mb-1">
              Pilih Pesanan
            </label>
            {pendingOrders.length > 0 ? (
              <select 
                className="input w-full"
                value={orderNumber}
                onChange={handleOrderChange}
              >
                <option value="">Pilih pesanan (Pending)</option>
                {pendingOrders.map(o => (
                  <option key={o.order_number} value={o.order_number}>
                    {o.order_number} - {formatRupiah(o.total)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Contoh: JG-XXXXXX"
                className="input w-full uppercase"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-navy-900)] mb-1">
              Transfer Dari Bank
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA, Mandiri, dll"
              className="input w-full"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-navy-900)] mb-1">
              Atas Nama (Pengirim)
            </label>
            <input
              type="text"
              placeholder="Nama pemilik rekening pengirim"
              className="input w-full"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-navy-900)] mb-1">
              Nominal Transfer
            </label>
            <input
              type="text"
              placeholder="Contoh: 150000"
              className="input w-full"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/\\D/g, ""))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-navy-900)] mb-1">
              Bukti Transfer (Foto/Screenshot)
            </label>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {!preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[color:var(--color-cloud-300)] rounded-xl p-8 hover:bg-[color:var(--color-cloud-100)] transition-colors text-[color:var(--color-muted)]"
              >
                <UploadCloud className="w-8 h-8" />
                <span className="text-sm">Klik untuk unggah gambar</span>
                <span className="text-xs">Maksimal 5MB (JPG, PNG)</span>
              </button>
            ) : (
              <div className="relative border border-[color:var(--color-cloud-200)] rounded-xl overflow-hidden p-2">
                <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-lg bg-[color:var(--color-cloud-50)]" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={submitting || !file} 
            className="btn btn-primary w-full"
          >
            {submitting ? "Mengunggah..." : "Kirim Konfirmasi"}
          </button>
        </form>
      </section>

      {/* History Section */}
      <section>
        <h2 className="text-lg font-bold mb-4">Riwayat Konfirmasi Anda</h2>
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
          {history.length === 0 ? (
            <p className="p-8 text-center text-sm text-[color:var(--color-muted)]">Belum ada riwayat konfirmasi pembayaran.</p>
          ) : (
            <div className="divide-y divide-[color:var(--color-line)]">
              {history.map((h, i) => (
                <div key={i} className="p-4 flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {h.status === "approved" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                     h.status === "rejected" ? <XCircle className="w-5 h-5 text-red-500" /> :
                     <Clock className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm">{h.order_number}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        h.status === "approved" ? "bg-green-100 text-green-700" :
                        h.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{h.status}</span>
                    </div>
                    <p className="text-xs text-[color:var(--color-muted)] mt-0.5">{formatDate(h.created_at)}</p>
                    <p className="text-sm mt-1">{h.bank_name} - {h.account_name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-bold text-[color:var(--color-navy-900)]">{formatRupiah(h.amount)}</p>
                      <a href={h.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <FileImage className="w-3 h-3" /> Lihat Resi
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
