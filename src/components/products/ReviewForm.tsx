"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

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
      <div className="text-sm text-[color:var(--color-success)] bg-[color:var(--color-success)]/10 p-3 rounded-lg mt-2">
        Terima kasih! Ulasan Anda untuk {productName} telah disimpan.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 bg-[color:var(--color-cloud-100)] p-4 rounded-xl border border-[color:var(--color-line)]">
      <p className="text-sm font-semibold mb-2">Beri ulasan untuk {productName}</p>
      
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={clsx(
                "h-6 w-6",
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        className="input text-sm w-full mb-3"
        rows={2}
        placeholder="Tulis ulasan Anda (opsional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p className="text-xs text-[color:var(--color-error)] mb-2">{error}</p>}

      <button type="submit" disabled={submitting} className="btn btn-primary !px-4 !py-2 text-xs">
        {submitting ? "Menyimpan..." : "Kirim Ulasan"}
      </button>
    </form>
  );
}
