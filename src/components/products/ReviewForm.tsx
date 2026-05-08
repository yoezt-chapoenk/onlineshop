"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  productId: string;
  orderId: string;
  productName: string;
}

export default function ReviewForm({ productId, orderId, productName }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Silakan pilih rating bintang terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/storefront/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, order_id: orderId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim ulasan");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{ fontSize: 14, color: "var(--success)", background: "rgba(52, 168, 83, 0.1)", padding: 12, border: "1px solid var(--success)", marginTop: 8 }}>
        Terima kasih! Ulasan Anda untuk {productName} telah disimpan.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 12, background: "var(--surface)", padding: 16, border: "1px solid var(--border)" }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Beri ulasan untuk {productName}</p>
      
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "transform 0.2s",
              color: (hoverRating || rating) >= star ? "var(--gold)" : "var(--border)"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Star
              style={{ width: 24, height: 24, fill: (hoverRating || rating) >= star ? "var(--gold)" : "none" }}
            />
          </button>
        ))}
      </div>

      <textarea
        style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", minHeight: 80, resize: "vertical", marginBottom: 12 }}
        rows={2}
        placeholder="Tulis ulasan Anda (opsional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p style={{ fontSize: 12, color: "var(--error)", marginBottom: 8 }}>{error}</p>}

      <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>
        {submitting ? "Menyimpan..." : "Kirim Ulasan"}
      </button>
    </form>
  );
}
