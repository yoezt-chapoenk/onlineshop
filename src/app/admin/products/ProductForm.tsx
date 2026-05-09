"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export interface ProductFormValues {
  id?: string;
  slug: string;
  sku: string;
  name: string;
  short_description: string;
  description: string;
  category_slug: string;
  category_label: string;
  gender: string;
  style: string;
  frame: string;
  retail_price: number;
  promotional_price: number | null;
  reseller_price: number | null;
  min_wholesale_qty: number;
  stock: number;
  weight_gram: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  rating: number;
  review_count: number;
  frame_color: string;
  lens_color: string | null;
  specs: { label: string; value: string }[];
  image_urls: string[];
  price_tiers: { min_qty: number; max_qty: number | null; unit_price: number; label: string }[];
  variants: {
    id?: string;
    sku: string;
    color: string | null;
    variant_type: string | null;
    size: string | null;
    stock: number;
    price_override: number | null;
    image_url: string | null;
    sort_order: number;
  }[];
}

interface Category {
  slug: string;
  name: string;
}

interface Props {
  initial: ProductFormValues;
  categories: Category[];
  mode: "create" | "edit";
}

const GENDERS = ["men", "women", "unisex", "kids"];
const STYLES = ["fashion", "casual", "sport", "vintage", "premium"];
const FRAMES = ["classic", "round", "aviator", "rectangle", "cateye", "browline"];
const FRAME_COLORS = ["black", "gold", "silver", "tortoise", "navy", "rose", "olive"];
const LENS_COLORS = ["clear", "smoke", "green", "amber", "blue", "mirror"];

export default function ProductForm({ initial, categories, mode }: Props) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setV((c) => ({ ...c, [key]: value }));
  }

  function setCategory(slug: string) {
    const cat = categories.find((c) => c.slug === slug);
    setV((c) => ({
      ...c,
      category_slug: slug,
      category_label: cat?.name ?? c.category_label,
    }));
  }

  function addTier() {
    update("price_tiers", [
      ...v.price_tiers,
      { min_qty: 1, max_qty: null, unit_price: v.retail_price, label: "Wholesale" },
    ]);
  }

  function addSpec() {
    update("specs", [...v.specs, { label: "", value: "" }]);
  }

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/products/upload-image", {
          method: "POST",
          body: fd,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.url) {
          setUploadError(body?.error ?? `Upload gagal (${res.status})`);
          break;
        }
        uploaded.push(body.url as string);
      }
      if (uploaded.length > 0) {
        update("image_urls", [...v.image_urls, ...uploaded]);
      }
    } finally {
      setUploading(false);
    }
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const next = [...v.image_urls];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    update("image_urls", next);
  }

  function removeImage(idx: number) {
    update(
      "image_urls",
      v.image_urls.filter((_, i) => i !== idx),
    );
  }

  function addVariant() {
    update("variants", [
      ...v.variants,
      {
        sku: `${v.sku}-V${v.variants.length + 1}`,
        color: "",
        variant_type: "",
        size: "",
        stock: 0,
        price_override: null,
        image_url: "",
        sort_order: v.variants.length,
      },
    ]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${v.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Failed (${res.status})`);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  async function remove() {
    if (!v.id) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${v.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Failed (${res.status})`);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const sectionStyle: React.CSSProperties = { borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 6, display: "block" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 14 };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <label className="block">
          <span className="label">Name</span>
          <input className="input mt-1" required value={v.name} onChange={(e) => {
            const newName = e.target.value;
            setV((c) => {
              const next = { ...c, name: newName };
              if (mode === "create" && !isSlugDirty) {
                next.slug = slugify(newName);
              }
              return next;
            });
          }} />
        </label>
        <label className="block">
          <span className="label">SKU</span>
          <input className="input mt-1" required value={v.sku} onChange={(e) => update("sku", e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Slug</span>
          <input className="input mt-1" required value={v.slug} onChange={(e) => {
            setIsSlugDirty(true);
            update("slug", e.target.value);
          }} />
        </label>
        <label className="block">
          <span className="label">Category</span>
          <select className="input mt-1" required value={v.category_slug} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>Select…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="label">Short description</span>
          <textarea className="input mt-1" rows={2} required value={v.short_description} onChange={(e) => update("short_description", e.target.value)} />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Full description</span>
          <textarea className="input mt-1" rows={5} required value={v.description} onChange={(e) => update("description", e.target.value)} />
        </label>
      </section>

      <section style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <label className="block">
          <span className="label">Retail price (Rp)</span>
          <input type="number" min={0} className="input mt-1" required value={v.retail_price} onChange={(e) => update("retail_price", Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Promo price</span>
          <input type="number" min={0} className="input mt-1" value={v.promotional_price ?? ""} onChange={(e) => update("promotional_price", e.target.value === "" ? null : Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Reseller price</span>
          <input type="number" min={0} className="input mt-1" value={v.reseller_price ?? ""} onChange={(e) => update("reseller_price", e.target.value === "" ? null : Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Min wholesale qty</span>
          <input type="number" min={0} className="input mt-1" value={v.min_wholesale_qty} onChange={(e) => update("min_wholesale_qty", Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Stock</span>
          <input type="number" min={0} className="input mt-1" required value={v.stock} onChange={(e) => update("stock", Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Weight (g)</span>
          <input type="number" min={0} className="input mt-1" required value={v.weight_gram} onChange={(e) => update("weight_gram", Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Rating</span>
          <input type="number" step="0.01" min={0} max={5} className="input mt-1" value={v.rating} onChange={(e) => update("rating", Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="label">Review count</span>
          <input type="number" min={0} className="input mt-1" value={v.review_count} onChange={(e) => update("review_count", Number(e.target.value))} />
        </label>
      </section>

      <section style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        <label className="block">
          <span className="label">Gender</span>
          <select className="input mt-1" value={v.gender} onChange={(e) => update("gender", e.target.value)}>
            {GENDERS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Style</span>
          <select className="input mt-1" value={v.style} onChange={(e) => update("style", e.target.value)}>
            {STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Frame</span>
          <select className="input mt-1" value={v.frame} onChange={(e) => update("frame", e.target.value)}>
            {FRAMES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Frame color</span>
          <select className="input mt-1" value={v.frame_color} onChange={(e) => update("frame_color", e.target.value)}>
            {FRAME_COLORS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Lens color</span>
          <select className="input mt-1" value={v.lens_color ?? ""} onChange={(e) => update("lens_color", e.target.value || null)}>
            <option value="">— none —</option>
            {LENS_COLORS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </section>

      <section style={{ ...sectionStyle, display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "var(--text)" }}>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={v.is_featured} onChange={(e) => update("is_featured", e.target.checked)} /> Featured
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={v.is_best_seller} onChange={(e) => update("is_best_seller", e.target.checked)} /> Best seller
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={v.is_new_arrival} onChange={(e) => update("is_new_arrival", e.target.checked)} /> New arrival
        </label>
      </section>

      <section style={{ ...sectionStyle, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text)" }}>Wholesale price tiers</h2>
          <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={addTier}>+ Add tier</button>
        </div>
        {v.price_tiers.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No tiers configured.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {v.price_tiers.map((t, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8, alignItems: "flex-end", fontSize: 14 }}>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>Min qty</span>
                  <input type="number" min={1} className="input mt-1" value={t.min_qty} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], min_qty: Number(e.target.value) };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>Max qty</span>
                  <input type="number" min={1} className="input mt-1" placeholder="∞" value={t.max_qty ?? ""} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], max_qty: e.target.value === "" ? null : Number(e.target.value) };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <label style={{ gridColumn: "span 3", display: "block" }}>
                  <span style={labelStyle}>Unit price</span>
                  <input type="number" min={0} className="input mt-1" value={t.unit_price} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], unit_price: Number(e.target.value) };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <label style={{ gridColumn: "span 4", display: "block" }}>
                  <span style={labelStyle}>Label</span>
                  <input className="input mt-1" value={t.label} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], label: e.target.value };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <button
                  type="button"
                  style={{ gridColumn: "span 1", fontSize: 12, color: "var(--error)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", alignSelf: "flex-end", paddingBottom: 10 }}
                  onClick={() => update("price_tiers", v.price_tiers.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ ...sectionStyle, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text)" }}>Gambar Produk</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Gambar pertama dipakai di kartu &amp; OG image. Maks 5MB per
              file. Format JPG/PNG/WEBP/GIF.
            </p>
          </div>
          <label className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
            {uploading ? "Mengunggah…" : "+ Tambah gambar"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              style={{ display: "none" }}
              disabled={uploading}
              onChange={(e) => {
                handleImageUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {uploadError && (
          <p style={{ fontSize: 12, color: "var(--error)" }}>{uploadError}</p>
        )}
        {v.image_urls.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Belum ada gambar. Storefront akan menampilkan ilustrasi SVG bawaan.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
            {v.image_urls.map((url, i) => (
              <div
                key={url + i}
                style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gambar ${i + 1}`}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                />
                {i === 0 && (
                  <span style={{ position: "absolute", top: 4, left: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 6px", borderRadius: 4, background: "var(--gold)", color: "var(--bg)" }}>
                    Utama
                  </span>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 12, padding: "4px 6px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      style={{ padding: "0 4px", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      style={{ padding: "0 4px", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
                      onClick={() => moveImage(i, 1)}
                      disabled={i === v.image_urls.length - 1}
                      title="Move down"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", textDecoration: "underline", fontSize: 12 }}
                    onClick={() => removeImage(i)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ ...sectionStyle, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text)" }}>Specs</h2>
          <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={addSpec}>+ Add spec</button>
        </div>
        {v.specs.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No specs.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {v.specs.map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8, alignItems: "flex-end", fontSize: 14 }}>
                <label style={{ gridColumn: "span 4", display: "block" }}>
                  <span style={labelStyle}>Label</span>
                  <input className="input mt-1" value={s.label} onChange={(e) => {
                    const specs = [...v.specs];
                    specs[i] = { ...specs[i], label: e.target.value };
                    update("specs", specs);
                  }} />
                </label>
                <label style={{ gridColumn: "span 7", display: "block" }}>
                  <span style={labelStyle}>Value</span>
                  <input className="input mt-1" value={s.value} onChange={(e) => {
                    const specs = [...v.specs];
                    specs[i] = { ...specs[i], value: e.target.value };
                    update("specs", specs);
                  }} />
                </label>
                <button
                  type="button"
                  style={{ gridColumn: "span 1", fontSize: 12, color: "var(--error)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", alignSelf: "flex-end", paddingBottom: 10 }}
                  onClick={() => update("specs", v.specs.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ ...sectionStyle, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text)" }}>Variants</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Kosongkan jika produk tanpa varian. Jika diisi, stok per
              varian menggantikan stok utama dan pelanggan wajib memilih.
            </p>
          </div>
          <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", whiteSpace: "nowrap" }} onClick={addVariant}>
            + Add variant
          </button>
        </div>
        {v.variants.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No variants configured.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {v.variants.map((vr, i) => (
              <div key={vr.id ?? i} style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8, alignItems: "flex-end", fontSize: 14 }}>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>SKU</span>
                  <input
                    className="input mt-1"
                    value={vr.sku}
                    onChange={(e) => {
                      const next = [...v.variants];
                      next[i] = { ...next[i], sku: e.target.value };
                      update("variants", next);
                    }}
                  />
                </label>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>Warna</span>
                  <input
                    className="input mt-1"
                    value={vr.color ?? ""}
                    onChange={(e) => {
                      const next = [...v.variants];
                      next[i] = { ...next[i], color: e.target.value || null };
                      update("variants", next);
                    }}
                  />
                </label>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>Tipe</span>
                  <input
                    className="input mt-1"
                    value={vr.variant_type ?? ""}
                    onChange={(e) => {
                      const next = [...v.variants];
                      next[i] = { ...next[i], variant_type: e.target.value || null };
                      update("variants", next);
                    }}
                  />
                </label>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>Ukuran</span>
                  <input
                    className="input mt-1"
                    value={vr.size ?? ""}
                    onChange={(e) => {
                      const next = [...v.variants];
                      next[i] = { ...next[i], size: e.target.value || null };
                      update("variants", next);
                    }}
                  />
                </label>
                <label style={{ gridColumn: "span 1", display: "block" }}>
                  <span style={labelStyle}>Stok</span>
                  <input
                    type="number"
                    min={0}
                    className="input mt-1"
                    value={vr.stock}
                    onChange={(e) => {
                      const next = [...v.variants];
                      next[i] = { ...next[i], stock: Number(e.target.value) };
                      update("variants", next);
                    }}
                  />
                </label>
                <label style={{ gridColumn: "span 2", display: "block" }}>
                  <span style={labelStyle}>Override harga</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="—"
                    className="input mt-1"
                    value={vr.price_override ?? ""}
                    onChange={(e) => {
                      const next = [...v.variants];
                      next[i] = {
                        ...next[i],
                        price_override:
                          e.target.value === "" ? null : Number(e.target.value),
                      };
                      update("variants", next);
                    }}
                  />
                </label>
                <div style={{ gridColumn: "span 12", display: "flex", gap: 8 }}>
                  <label style={{ flex: 1, display: "block" }}>
                    <span style={labelStyle}>Image URL</span>
                    <input
                      className="input mt-1 text-xs"
                      placeholder="https://..."
                      value={vr.image_url ?? ""}
                      onChange={(e) => {
                        const next = [...v.variants];
                        next[i] = { ...next[i], image_url: e.target.value || null };
                        update("variants", next);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    style={{ fontSize: 12, color: "var(--error)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", alignSelf: "flex-end", paddingBottom: 10, flexShrink: 0 }}
                    onClick={() =>
                      update(
                        "variants",
                        v.variants
                          .filter((_, j) => j !== i)
                          .map((x, idx) => ({ ...x, sort_order: idx })),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error ? <p style={{ fontSize: 14, color: "var(--error)" }}>{error}</p> : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, position: "sticky", bottom: 0, background: "var(--bg)", paddingBlock: 12, borderTop: "1px solid var(--border)", marginInline: -20 }}>
        <div style={{ paddingInline: 20, display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
          </button>
          {mode === "edit" && (
            <button type="button" style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }} onClick={remove} disabled={pending}>
              Delete
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
