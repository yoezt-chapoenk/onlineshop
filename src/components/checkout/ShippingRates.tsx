"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";

export interface ShippingRate {
  courierCode: string;
  courierName: string;
  courierServiceCode: string;
  courierServiceName: string;
  description: string;
  price: number;
  duration: string;
  durationRange: string;
  durationUnit: string;
  type: string;
}

interface CartItemForRate {
  name: string;
  retailPrice: number;
  weightGram: number;
  quantity: number;
}

interface ShippingRatesProps {
  postalCode: string | null;
  items: CartItemForRate[];
  selectedId: string | null;
  onSelect: (rate: ShippingRate) => void;
  disabled?: boolean;
}

function rateId(r: ShippingRate): string {
  return `${r.courierCode}::${r.courierServiceCode}`;
}

/** Uppercase the first letter and lowercase the rest for courier names. */
function formatCourierName(name: string): string {
  // Some courier names come as all-lowercase like "jne" or "jnt"
  const upper = name.toUpperCase();
  if (upper === "JNT") return "J&T";
  if (upper === "SENTRALCARGO") return "Central Cargo";
  return upper;
}

export default function ShippingRates({
  postalCode,
  items,
  selectedId,
  onSelect,
  disabled,
}: ShippingRatesProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchRates = useCallback(async () => {
    if (!postalCode || items.length === 0) return;

    setLoading(true);
    setError(null);
    setFetched(false);

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationPostalCode: postalCode,
          items: items.map((it) => ({
            name: it.name,
            value: it.retailPrice,
            weight: it.weightGram,
            quantity: it.quantity,
          })),
        }),
      });

      const json = (await res.json()) as {
        rates?: ShippingRate[];
        error?: string;
      };
      if (!res.ok || !json.rates) {
        throw new Error(json.error ?? "Gagal memuat tarif pengiriman.");
      }
      setRates(json.rates);
      setFetched(true);

      // Auto-select cheapest if nothing selected yet
      if (json.rates.length > 0 && !selectedId) {
        onSelect(json.rates[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat tarif pengiriman.",
      );
      setRates([]);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, [postalCode, items, selectedId, onSelect]);

  // Fetch rates when postal code or items change
  useEffect(() => {
    if (postalCode && items.length > 0) {
      // eslint-disable-next-line
      fetchRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode]);

  if (!postalCode) {
    return (
      <div style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", padding: "16px 0" }}>
        Pilih kota / kecamatan tujuan untuk melihat tarif pengiriman.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 0", fontSize: 14, color: "var(--text-muted)" }}>
        <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" />
        <span>Memuat tarif kurir…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 14, color: "var(--error)" }}>{error}</p>
        <button
          type="button"
          onClick={fetchRates}
          className="btn btn-outline"
          style={{ padding: "8px 16px", fontSize: 12, alignSelf: "flex-start" }}
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (fetched && rates.length === 0) {
    return (
      <div style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", padding: "16px 0" }}>
        Tidak ada kurir yang tersedia untuk tujuan ini.
      </div>
    );
  }

  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
      {rates.map((rate) => {
        const id = rateId(rate);
        const selected = selectedId === id;
        return (
          <li key={id}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "1px solid",
                borderColor: selected ? "var(--gold)" : "var(--border)",
                background: selected ? "var(--bg2)" : "transparent",
                padding: 16,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--text-muted)"; }}
              onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <input
                type="radio"
                name="shipping"
                value={id}
                checked={selected}
                disabled={disabled}
                onChange={() => onSelect(rate)}
                style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
              />
              <Truck style={{ width: 16, height: 16, flexShrink: 0, color: selected ? "var(--gold)" : "var(--text-muted)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                  {formatCourierName(rate.courierName)} ·{" "}
                  {rate.courierServiceName}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Estimasi {rate.duration}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                {formatRupiah(rate.price)}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
