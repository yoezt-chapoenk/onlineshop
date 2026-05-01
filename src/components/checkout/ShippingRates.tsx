"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, Loader2 } from "lucide-react";
import clsx from "clsx";
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
      <div className="text-sm text-[color:var(--color-muted)] italic py-4">
        Pilih kota / kecamatan tujuan untuk melihat tarif pengiriman.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6 text-sm text-[color:var(--color-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Memuat tarif kurir…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[color:var(--color-error)]">{error}</p>
        <button
          type="button"
          onClick={fetchRates}
          className="btn btn-outline text-xs py-1.5 px-3"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (fetched && rates.length === 0) {
    return (
      <div className="text-sm text-[color:var(--color-muted)] italic py-4">
        Tidak ada kurir yang tersedia untuk tujuan ini.
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {rates.map((rate) => {
        const id = rateId(rate);
        const selected = selectedId === id;
        return (
          <li key={id}>
            <label
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
                selected
                  ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)]/[0.03]"
                  : "border-[color:var(--color-line)] hover:border-[color:var(--color-navy-300)]",
              )}
            >
              <input
                type="radio"
                name="shipping"
                value={id}
                checked={selected}
                disabled={disabled}
                onChange={() => onSelect(rate)}
                className="h-4 w-4 accent-[color:var(--color-navy-900)]"
              />
              <Truck className="h-4 w-4 shrink-0 text-[color:var(--color-navy-600)]" />
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {formatCourierName(rate.courierName)} ·{" "}
                  {rate.courierServiceName}
                </div>
                <div className="text-xs text-[color:var(--color-muted)]">
                  Estimasi {rate.duration}
                </div>
              </div>
              <div className="text-sm font-bold text-[color:var(--color-navy-900)]">
                {formatRupiah(rate.price)}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
