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

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="label">Name</span>
          <input className="input mt-1" required value={v.name} onChange={(e) => update("name", e.target.value)} />
        </label>
        <label className="block">
          <span className="label">SKU</span>
          <input className="input mt-1" required value={v.sku} onChange={(e) => update("sku", e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Slug</span>
          <input className="input mt-1" required value={v.slug} onChange={(e) => update("slug", e.target.value)} />
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

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
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

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 flex flex-wrap gap-4 text-sm">
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

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]">Wholesale price tiers</h2>
          <button type="button" className="btn btn-outline text-xs" onClick={addTier}>+ Add tier</button>
        </div>
        {v.price_tiers.length === 0 ? (
          <p className="text-sm text-[color:var(--color-navy-400)]">No tiers configured.</p>
        ) : (
          <div className="space-y-2">
            {v.price_tiers.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end text-sm">
                <label className="col-span-2 block">
                  <span className="label">Min qty</span>
                  <input type="number" min={1} className="input mt-1" value={t.min_qty} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], min_qty: Number(e.target.value) };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <label className="col-span-2 block">
                  <span className="label">Max qty</span>
                  <input type="number" min={1} className="input mt-1" placeholder="∞" value={t.max_qty ?? ""} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], max_qty: e.target.value === "" ? null : Number(e.target.value) };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <label className="col-span-3 block">
                  <span className="label">Unit price</span>
                  <input type="number" min={0} className="input mt-1" value={t.unit_price} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], unit_price: Number(e.target.value) };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <label className="col-span-4 block">
                  <span className="label">Label</span>
                  <input className="input mt-1" value={t.label} onChange={(e) => {
                    const tiers = [...v.price_tiers];
                    tiers[i] = { ...tiers[i], label: e.target.value };
                    update("price_tiers", tiers);
                  }} />
                </label>
                <button
                  type="button"
                  className="col-span-1 text-xs text-[color:var(--color-error)] hover:underline pb-2.5"
                  onClick={() => update("price_tiers", v.price_tiers.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em]">Gambar Produk</h2>
            <p className="text-xs text-[color:var(--color-navy-400)] mt-0.5">
              Gambar pertama dipakai di kartu &amp; OG image. Maks 5MB per
              file. Format JPG/PNG/WEBP/GIF.
            </p>
          </div>
          <label className="btn btn-outline text-xs cursor-pointer">
            {uploading ? "Mengunggah…" : "+ Tambah gambar"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                handleImageUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {uploadError && (
          <p className="text-xs text-[color:var(--color-error)]">{uploadError}</p>
        )}
        {v.image_urls.length === 0 ? (
          <p className="text-sm text-[color:var(--color-navy-400)]">
            Belum ada gambar. Storefront akan menampilkan ilustrasi SVG bawaan.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {v.image_urls.map((url, i) => (
              <div
                key={url + i}
                className="relative rounded-xl overflow-hidden border border-[color:var(--color-cloud-200)] bg-[color:var(--color-cloud-50)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gambar ${i + 1}`}
                  className="w-full aspect-square object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[color:var(--color-navy-900)] text-white">
                    Utama
                  </span>
                )}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-black/60 text-white text-xs px-1.5 py-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="px-1 disabled:opacity-40"
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="px-1 disabled:opacity-40"
                      onClick={() => moveImage(i, 1)}
                      disabled={i === v.image_urls.length - 1}
                      title="Move down"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    className="hover:underline"
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

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]">Specs</h2>
          <button type="button" className="btn btn-outline text-xs" onClick={addSpec}>+ Add spec</button>
        </div>
        {v.specs.length === 0 ? (
          <p className="text-sm text-[color:var(--color-navy-400)]">No specs.</p>
        ) : (
          <div className="space-y-2">
            {v.specs.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end text-sm">
                <label className="col-span-4 block">
                  <span className="label">Label</span>
                  <input className="input mt-1" value={s.label} onChange={(e) => {
                    const specs = [...v.specs];
                    specs[i] = { ...specs[i], label: e.target.value };
                    update("specs", specs);
                  }} />
                </label>
                <label className="col-span-7 block">
                  <span className="label">Value</span>
                  <input className="input mt-1" value={s.value} onChange={(e) => {
                    const specs = [...v.specs];
                    specs[i] = { ...specs[i], value: e.target.value };
                    update("specs", specs);
                  }} />
                </label>
                <button
                  type="button"
                  className="col-span-1 text-xs text-[color:var(--color-error)] hover:underline pb-2.5"
                  onClick={() => update("specs", v.specs.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em]">Variants</h2>
            <p className="text-xs text-[color:var(--color-navy-400)] mt-0.5">
              Kosongkan jika produk tanpa varian. Jika diisi, stok per
              varian menggantikan stok utama dan pelanggan wajib memilih.
            </p>
          </div>
          <button type="button" className="btn btn-outline text-xs" onClick={addVariant}>
            + Add variant
          </button>
        </div>
        {v.variants.length === 0 ? (
          <p className="text-sm text-[color:var(--color-navy-400)]">No variants configured.</p>
        ) : (
          <div className="space-y-2">
            {v.variants.map((vr, i) => (
              <div key={vr.id ?? i} className="grid grid-cols-12 gap-2 items-end text-sm">
                <label className="col-span-2 block">
                  <span className="label">SKU</span>
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
                <label className="col-span-2 block">
                  <span className="label">Warna</span>
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
                <label className="col-span-2 block">
                  <span className="label">Tipe</span>
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
                <label className="col-span-2 block">
                  <span className="label">Ukuran</span>
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
                <label className="col-span-1 block">
                  <span className="label">Stok</span>
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
                <label className="col-span-2 block">
                  <span className="label">Override harga</span>
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
                <div className="col-span-12 flex gap-2">
                  <label className="flex-1 block">
                    <span className="label">Image URL</span>
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
                    className="text-xs text-[color:var(--color-error)] hover:underline self-end pb-2.5 shrink-0"
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

      {error ? <p className="text-sm text-[color:var(--color-error)]">{error}</p> : null}

      <div className="flex flex-wrap gap-2 sticky bottom-0 bg-[color:var(--color-cloud-100)] py-3 border-t border-[color:var(--color-cloud-200)] -mx-5 sm:-mx-8 px-5 sm:px-8">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button type="button" className="btn btn-ghost text-[color:var(--color-error)]" onClick={remove} disabled={pending}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
