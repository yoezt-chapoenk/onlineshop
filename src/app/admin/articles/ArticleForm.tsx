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
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
  color: "var(--text)", padding: "10px 14px", outline: "none", fontSize: 14,
  fontFamily: "var(--font-sans)", marginTop: 6,
};

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

  const tabBtn = (isActive: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
    background: isActive ? "var(--surface)" : "transparent",
    color: isActive ? "var(--text)" : "var(--text-muted)",
    border: isActive ? "1px solid var(--border)" : "1px solid transparent",
    fontFamily: "var(--font-sans)",
  });

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        <label style={{ display: "block" }}>
          <span className="label">Judul Artikel</span>
          <input
            style={inputStyle}
            required
            value={v.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setV((c) => {
                const next = { ...c, title: newTitle };
                if (mode === "create" && !isSlugDirty) next.slug = slugify(newTitle);
                return next;
              });
            }}
          />
        </label>

        <label style={{ display: "block" }}>
          <span className="label">Slug (URL)</span>
          <input
            style={inputStyle}
            required
            value={v.slug}
            onChange={(e) => { setIsSlugDirty(true); setV((c) => ({ ...c, slug: e.target.value })); }}
          />
        </label>

        <label style={{ display: "block" }}>
          <span className="label">URL Gambar Sampul (Opsional)</span>
          <input
            type="url"
            style={inputStyle}
            value={v.image_url}
            onChange={(e) => setV((c) => ({ ...c, image_url: e.target.value }))}
            placeholder="https://..."
          />
        </label>

        {/* Markdown editor */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="label" style={{ margin: 0 }}>Konten</span>
            <div style={{ display: "flex", gap: 4, background: "var(--bg2)", border: "1px solid var(--border)", padding: 2 }}>
              <button type="button" onClick={() => setTab("write")} style={tabBtn(tab === "write")}>
                <PenLine style={{ width: 12, height: 12 }} /> Tulis
              </button>
              <button type="button" onClick={() => setTab("preview")} style={tabBtn(tab === "preview")}>
                <Eye style={{ width: 12, height: 12 }} /> Preview
              </button>
            </div>
          </div>

          {tab === "write" ? (
            <textarea
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, minHeight: 360, resize: "vertical", marginTop: 0 }}
              rows={18}
              required
              value={v.content}
              onChange={(e) => setV((c) => ({ ...c, content: e.target.value }))}
              placeholder={"# Judul Utama\n\nTulis konten artikel Anda di sini...\n\n## Sub Judul\n\nParagraf konten..."}
            />
          ) : (
            <div style={{ border: "1px solid var(--border)", background: "var(--bg)", padding: 20, minHeight: 288, overflowY: "auto" }}>
              {v.content.trim() ? (
                <div className="article-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>Belum ada konten untuk di-preview.</p>
              )}
            </div>
          )}
          <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
            Mendukung sintaks Markdown: **bold**, *italic*, # Heading, - list, `kode`, dll.
          </p>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
            checked={v.is_published}
            onChange={(e) => setV((c) => ({ ...c, is_published: e.target.checked }))}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Publish sekarang</span>
        </label>
      </div>

      {error && <p style={{ fontSize: 13, color: "var(--error)" }}>{error}</p>}

      <div style={{ display: "flex", gap: 12 }}>
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
