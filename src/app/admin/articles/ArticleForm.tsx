"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { Eye, PenLine } from "lucide-react";

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
  const [tab, setTab] = useState<"write" | "preview">("write");

  const previewHtml = useMemo(() => parseMarkdown(v.content || ""), [v.content]);

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
    <form onSubmit={submit} className="space-y-6 max-w-5xl">
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

        {/* --- Markdown Editor with Live Preview --- */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="label">Konten</span>
            <div className="flex items-center gap-1 rounded-lg border border-[color:var(--color-cloud-200)] p-0.5 bg-[color:var(--color-cloud-100)]">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  tab === "write"
                    ? "bg-white text-[color:var(--color-navy-900)] shadow-sm"
                    : "text-[color:var(--color-navy-400)] hover:text-[color:var(--color-navy-900)]"
                }`}
              >
                <PenLine className="h-3 w-3" />
                Tulis
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  tab === "preview"
                    ? "bg-white text-[color:var(--color-navy-900)] shadow-sm"
                    : "text-[color:var(--color-navy-400)] hover:text-[color:var(--color-navy-900)]"
                }`}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>
          </div>

          {tab === "write" ? (
            <textarea
              className="input font-mono text-sm w-full"
              rows={18}
              required
              value={v.content}
              onChange={(e) => setV((c) => ({ ...c, content: e.target.value }))}
              placeholder={"# Judul Utama\n\nTulis konten artikel Anda di sini...\n\n## Sub Judul\n\nParagraf konten..."}
            />
          ) : (
            <div className="rounded-xl border border-[color:var(--color-cloud-200)] bg-white p-5 min-h-[18rem] overflow-auto">
              {v.content.trim() ? (
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="text-sm text-[color:var(--color-muted)] italic">
                  Belum ada konten untuk di-preview.
                </p>
              )}
            </div>
          )}

          <p className="mt-1.5 text-xs text-[color:var(--color-navy-400)]">
            Mendukung sintaks Markdown: **bold**, *italic*, # Heading, - list, `kode`, dll.
          </p>
        </div>

        <label className="flex items-center gap-2 mt-2 cursor-pointer">
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
