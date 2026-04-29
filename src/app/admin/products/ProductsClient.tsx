"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Upload, Download, Search } from "lucide-react";
import { money } from "@/lib/admin/format";

interface Row {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_label: string;
  category_slug: string;
  retail_price: number;
  promotional_price: number | null;
  stock: number;
  is_featured: boolean;
}

interface Props {
  initialProducts: Row[];
  categories: { slug: string; name: string }[];
}

interface ImportResult {
  inserted: number;
  updated: number;
  failed: { row: number; sku?: string; reason: string }[];
}

export default function ProductsClient({ initialProducts, categories }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<Row[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (
        q &&
        !(
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (category && p.category_slug !== category) return false;
      if (stockFilter === "in" && p.stock <= 0) return false;
      if (stockFilter === "out" && p.stock > 0) return false;
      return true;
    });
  }, [products, search, category, stockFilter]);

  async function handleDelete(p: Row) {
    if (!confirm(`Hapus produk "${p.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Gagal menghapus: ${body.error ?? res.statusText}`);
        return;
      }
      setProducts((curr) => curr.filter((x) => x.id !== p.id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setImportError(body?.error ?? `Import failed (${res.status})`);
        return;
      }
      setImportResult(body as ImportResult);
      router.refresh();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Products</h1>
          <p className="text-sm text-[color:var(--color-navy-400)]">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* CSV download endpoint, not a Next page; <Link> isn't appropriate. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/products/import/template"
            className="btn btn-outline text-xs inline-flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" /> Template CSV
          </a>
          <button
            type="button"
            className="btn btn-outline text-xs inline-flex items-center gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-3.5 w-3.5" />{" "}
            {importing ? "Mengimpor…" : "Impor CSV/XLSX"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          <Link href="/admin/products/new" className="btn btn-primary text-xs">
            + New product
          </Link>
        </div>
      </header>

      {importError && (
        <div className="rounded-2xl border border-[color:var(--color-error)] bg-red-50 p-4 text-sm text-[color:var(--color-error)]">
          {importError}
        </div>
      )}
      {importResult && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          <div className="font-semibold mb-1">
            Impor selesai: {importResult.inserted} ditambahkan,{" "}
            {importResult.updated} diperbarui, {importResult.failed.length} gagal.
          </div>
          {importResult.failed.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs space-y-0.5">
              {importResult.failed.slice(0, 25).map((f, i) => (
                <li key={i}>
                  Baris {f.row}
                  {f.sku ? ` (SKU ${f.sku})` : ""}: {f.reason}
                </li>
              ))}
              {importResult.failed.length > 25 && (
                <li>+{importResult.failed.length - 25} lagi…</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-navy-400)]" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Cari nama, SKU, atau slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as "all" | "in" | "out")}
        >
          <option value="all">Semua stok</option>
          <option value="in">Stok tersedia</option>
          <option value="out">Stok habis</option>
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)] bg-[color:var(--color-cloud-100)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Retail</th>
                <th className="px-4 py-3">Promo</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-[color:var(--color-navy-400)]"
                  >
                    {products.length === 0
                      ? "Belum ada produk."
                      : "Tidak ada produk yang cocok."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-[color:var(--color-cloud-200)] hover:bg-[color:var(--color-cloud-50)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-[color:var(--color-blue-600)] hover:underline font-medium"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-[color:var(--color-navy-400)]">
                        /{p.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">{p.category_label}</td>
                    <td className="px-4 py-3">{money(p.retail_price)}</td>
                    <td className="px-4 py-3">
                      {p.promotional_price ? (
                        money(p.promotional_price)
                      ) : (
                        <span className="text-[color:var(--color-navy-400)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.is_featured ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-blue-100)] text-[color:var(--color-navy-900)]">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[color:var(--color-navy-400)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-[color:var(--color-cloud-200)]"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[color:var(--color-error)] hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleDelete(p)}
                          disabled={busyId === p.id}
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />{" "}
                          {busyId === p.id ? "…" : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
