import { formatRupiah } from "@/lib/format";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "packed",
  "shipped",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const RESELLER_STATUSES = ["new", "approved", "rejected"] as const;

export type ResellerAppStatus = (typeof RESELLER_STATUSES)[number];

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export function money(n: number | null | undefined): string {
  return formatRupiah(n ?? 0);
}

export const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-[color:var(--color-blue-50)] text-[color:var(--color-navy-900)]" },
  paid: { label: "Paid", className: "bg-[color:var(--color-blue-100)] text-[color:var(--color-navy-900)]" },
  processing: { label: "Processing", className: "bg-[color:var(--color-blue-100)] text-[color:var(--color-navy-900)]" },
  packed: { label: "Packed", className: "bg-[color:var(--color-blue-200)] text-[color:var(--color-navy-900)]" },
  shipped: { label: "Shipped", className: "bg-[color:var(--color-navy-300)] text-white" },
  fulfilled: { label: "Fulfilled", className: "bg-[color:var(--color-navy-900)] text-white" },
  cancelled: { label: "Cancelled", className: "bg-[color:var(--color-cloud-300)] text-[color:var(--color-ink)]" },
  refunded: { label: "Refunded", className: "bg-[color:var(--color-cloud-200)] text-[color:var(--color-ink)]" },
};
