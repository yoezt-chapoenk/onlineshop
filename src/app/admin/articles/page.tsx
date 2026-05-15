"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/admin/format";

interface Article {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/articles");
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Hapus artikel ini?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Artikel</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>Kelola konten blog untuk SEO.</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary" style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Plus style={{ width: 14, height: 14 }} /> Tulis Artikel
        </Link>
      </header>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Memuat...</p>
        ) : articles.length === 0 ? (
          <p style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Belum ada artikel.</p>
        ) : (
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
                <th style={{ padding: "10px 16px", fontWeight: 600 }}>Judul</th>
                <th style={{ padding: "10px 16px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "10px 16px", fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: "10px 16px", fontWeight: 600, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="admin-row" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text)" }}>{a.title}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", padding: "2px 8px",
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                      background: a.is_published ? "rgba(126,179,232,0.1)" : "rgba(122,144,176,0.1)",
                      color: a.is_published ? "var(--gold)" : "var(--text-muted)",
                      border: `1px solid ${a.is_published ? "var(--gold-dim)" : "var(--border)"}`,
                    }}>
                      {a.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{formatDateTime(a.created_at)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      <Link href={`/admin/articles/${a.id}`} className="admin-btn-edit" title="Edit">
                        <Edit2 style={{ width: 14, height: 14 }} /> Edit
                      </Link>
                      <button onClick={() => remove(a.id)} className="admin-btn-delete" title="Hapus">
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
