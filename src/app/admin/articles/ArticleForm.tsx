"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ArticleFormValues {
  id?: string;
  slug: string;
  title: string;
  content: string;
  image_url: string;
  is_published: boolean;
}

interface Props {
  initial: ArticleFormValues;
  mode: "create" | "edit";
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export default function ArticleForm({ initial, mode }: Props) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/articles" : `/api/admin/articles/${v.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Gagal menyimpan artikel");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl">
      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-4">
        <label className="block">
          <span className="label">Judul Artikel</span>
          <input
            className="input mt-1"
            required
            value={v.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setV((c) => {
                const next = { ...c, title: newTitle };
                if (mode === "create" && !isSlugDirty) {
                  next.slug = slugify(newTitle);
                }
                return next;
              });
            }}
          />
        </label>
        
        <label className="block">
          <span className="label">Slug (URL)</span>
          <input
            className="input mt-1"
            required
            value={v.slug}
            onChange={(e) => {
              setIsSlugDirty(true);
              setV((c) => ({ ...c, slug: e.target.value }));
            }}
          />
        </label>

        <label className="block">
          <span className="label">URL Gambar Sampul (Opsional)</span>
          <input
            type="url"
            className="input mt-1"
            value={v.image_url}
            onChange={(e) => setV((c) => ({ ...c, image_url: e.target.value }))}
            placeholder="https://..."
          />
        </label>

        <label className="block">
          <span className="label">Konten (Mendukung Markdown)</span>
          <textarea
            className="input mt-1 font-mono text-sm"
            rows={15}
            required
            value={v.content}
            onChange={(e) => setV((c) => ({ ...c, content: e.target.value }))}
            placeholder="# Judul Utama\n\nTulis konten artikel Anda di sini..."
          />
        </label>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            checked={v.is_published}
            onChange={(e) => setV((c) => ({ ...c, is_published: e.target.checked }))}
          />
          <span className="text-sm font-medium">Publish sekarang</span>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Menyimpan..." : "Simpan Artikel"}
        </button>
        <button type="button" onClick={() => router.back()} disabled={saving} className="btn btn-outline">
          Batal
        </button>
      </div>
    </form>
  );
}
