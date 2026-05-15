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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Products</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            {filtered.length} of {products.length} products
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {/* CSV download endpoint, not a Next page; <Link> isn't appropriate. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/products/import/template"
            className="btn btn-outline"
            style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px" }}
          >
            <Download style={{ width: 14, height: 14 }} /> Template CSV
          </a>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload style={{ width: 14, height: 14 }} />{" "}
            {importing ? "Mengimpor…" : "Impor CSV/XLSX"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          <Link href="/admin/products/new" className="btn btn-primary" style={{ fontSize: 12, padding: "6px 12px" }}>
            + New product
          </Link>
        </div>
      </header>

      {importError && (
        <div style={{ borderRadius: 16, border: "1px solid var(--error)", background: "rgba(255,0,0,0.05)", padding: 16, fontSize: 14, color: "var(--error)" }}>
          {importError}
        </div>
      )}
      {importResult && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Impor selesai: {importResult.inserted} ditambahkan,{" "}
            {importResult.updated} diperbarui, {importResult.failed.length} gagal.
          </div>
          {importResult.failed.length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 12, display: "flex", flexDirection: "column", gap: 2 }}>
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

      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "var(--text-muted)" }} />
          <input
            type="search"
            style={{ width: "100%", padding: "8px 12px 8px 36px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 14 }}
            placeholder="Cari nama, SKU, atau slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={{ width: "auto", padding: "8px 32px 8px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 14 }}
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
          style={{ width: "auto", padding: "8px 32px 8px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 14 }}
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as "all" | "in" | "out")}
        >
          <option value="all">Semua stok</option>
          <option value="in">Stok tersedia</option>
          <option value="out">Stok habis</option>
        </select>
      </div>

      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px" }}>Product</th>
                <th style={{ padding: "12px 16px" }}>SKU</th>
                <th style={{ padding: "12px 16px" }}>Category</th>
                <th style={{ padding: "12px 16px" }}>Retail</th>
                <th style={{ padding: "12px 16px" }}>Promo</th>
                <th style={{ padding: "12px 16px" }}>Stock</th>
                <th style={{ padding: "12px 16px" }}>Featured</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}
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
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                    className="admin-row"
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <Link
                        href={`/admin/products/${p.id}`}
                        style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}
                      >
                        {p.name}
                      </Link>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        /{p.slug}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text)" }}>{p.sku}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{p.category_label}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{money(p.retail_price)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>
                      {p.promotional_price ? (
                        money(p.promotional_price)
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: p.stock <= 0 ? "var(--error)" : "var(--gold)" }}>{p.stock}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.is_featured ? (
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: "var(--bg2)", color: "var(--text)" }}>
                          Featured
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="admin-btn-edit"
                          title="Edit"
                        >
                          <Pencil style={{ width: 14, height: 14 }} /> Edit
                        </Link>
                        <button
                          type="button"
                          className="admin-btn-delete"
                          style={{ opacity: busyId === p.id ? 0.5 : 1 }}
                          onClick={() => handleDelete(p)}
                          disabled={busyId === p.id}
                          title="Hapus"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />{" "}
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
