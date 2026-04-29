"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassesArt from "@/components/products/GlassesArt";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { calculateCartTotals } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, isHydrated } = useCart();
  const { isReseller } = useSession();
  const totals = calculateCartTotals(items, isReseller);

  if (!isHydrated) {
    return (
      <div>
        <PageHeader title="Keranjang Belanja" breadcrumbs={[{ label: "Keranjang" }]} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-sm text-[color:var(--color-muted)]">
          Memuat keranjang…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader
          title="Keranjang Belanja"
          description="Keranjang Anda masih kosong — yuk cari frame favorit Anda."
          breadcrumbs={[{ label: "Keranjang" }]}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-cloud-100)] text-[color:var(--color-navy-900)]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Keranjang Anda kosong</h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Telusuri katalog kami dan tambahkan frame favorit Anda.
          </p>
          <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
            Lanjut belanja <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Keranjang Belanja"
        description={`${totals.itemCount} item di keranjang Anda`}
        breadcrumbs={[{ label: "Keranjang" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-[color:var(--color-cloud-100)] text-[color:var(--color-muted)] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium py-3 px-5">Produk</th>
                <th className="text-center font-medium py-3 px-2 hidden sm:table-cell">
                  Jumlah
                </th>
                <th className="text-right font-medium py-3 px-5">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-line)]">
              {totals.lineItems.map(({ item, pricing }) => {
                // The cart now reads `frame` and `stock` straight off
                // the cart item itself (set in CartProvider.addItem),
                // so it works for both seed and Supabase-sourced
                // products without doing an id lookup.
                const frame = item.frame ?? "rectangle";
                const maxQty = item.stock ?? 99;
                return (
                  <tr key={item.lineId}>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 shrink-0 rounded-lg bg-[color:var(--color-cloud-100)] flex items-center justify-center">
                          <GlassesArt
                            product={{
                              frame,
                              frameColor: item.frameColor,
                              lensColor: item.lensColor,
                              category: item.category,
                            }}
                            size={64}
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/shop/${item.slug}`}
                            className="text-sm font-semibold hover:underline line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {item.variantLabel ? (
                            <div className="mt-0.5 text-xs text-[color:var(--color-navy-900)]">
                              {item.variantLabel}
                            </div>
                          ) : null}
                          <div className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                            SKU {item.sku}
                          </div>
                          <div className="mt-1 text-xs text-[color:var(--color-navy-900)] font-medium">
                            {pricing.tierLabel ?? "Harga retail"} ·{" "}
                            {formatRupiah(pricing.unitPrice)}
                          </div>
                          <div className="mt-2 sm:hidden">
                            <QtyControl
                              value={item.quantity}
                              onChange={(q) => updateQuantity(item.lineId, q)}
                              max={maxQty}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 hidden sm:table-cell">
                      <div className="flex justify-center">
                        <QtyControl
                          value={item.quantity}
                          onChange={(q) => updateQuantity(item.lineId, q)}
                          max={maxQty}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="text-sm font-bold text-[color:var(--color-ink)]">
                        {formatRupiah(pricing.subtotal)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-error)]"
                      >
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-base font-semibold">Ringkasan pesanan</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">
                Subtotal ({totals.itemCount} item)
              </dt>
              <dd className="font-semibold">{formatRupiah(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">Perkiraan berat</dt>
              <dd className="font-semibold">{(totals.weightGram / 1000).toFixed(2)} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">Ongkos kirim</dt>
              <dd className="text-[color:var(--color-muted)]">Dihitung di checkout</dd>
            </div>
          </dl>
          <div className="mt-5 pt-5 border-t border-[color:var(--color-line)] flex justify-between text-base">
            <span className="font-semibold">Perkiraan total</span>
            <span className="font-bold text-[color:var(--color-navy-900)]">
              {formatRupiah(totals.subtotal)}
            </span>
          </div>
          <Link href="/checkout" className="btn btn-primary w-full mt-6">
            Lanjut ke checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/shop" className="btn btn-ghost w-full mt-2 text-sm">
            Lanjut belanja
          </Link>
          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            Harga grosir otomatis berlaku berdasarkan jumlah pembelian. Harga
            reseller berlaku untuk akun reseller yang disetujui.
          </p>
        </aside>
      </div>
    </div>
  );
}

function QtyControl({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (q: number) => void;
  max: number;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[color:var(--color-line)] overflow-hidden">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        className="h-9 w-9 flex items-center justify-center hover:bg-[color:var(--color-cloud-100)]"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.max(1, Math.min(max, Math.floor(v))));
        }}
        className="h-9 w-12 text-center text-sm font-semibold border-x border-[color:var(--color-line)] focus:outline-none"
      />
      <button
        type="button"
        aria-label="Tambah jumlah"
        className="h-9 w-9 flex items-center justify-center hover:bg-[color:var(--color-cloud-100)]"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
