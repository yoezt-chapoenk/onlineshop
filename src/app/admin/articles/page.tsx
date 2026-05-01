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
    if (res.ok) {
      setArticles(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Hapus artikel ini?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">Artikel</h1>
          <p className="text-sm text-[color:var(--color-navy-400)]">Kelola konten blog untuk SEO.</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Tulis Artikel
        </Link>
      </header>

      <div className="rounded-2xl border border-[color:var(--color-cloud-200)] bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[color:var(--color-navy-400)]">Memuat...</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-sm text-[color:var(--color-navy-400)]">Belum ada artikel.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Judul</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Tanggal</th>
                <th className="px-5 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-cloud-200)]">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-[color:var(--color-cloud-50)]">
                  <td className="px-5 py-4 font-medium text-[color:var(--color-navy-900)]">{a.title}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      a.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {a.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[color:var(--color-navy-400)]">{formatDateTime(a.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/articles/${a.id}`} className="p-2 text-[color:var(--color-navy-400)] hover:text-blue-600 transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(a.id)} className="p-2 text-[color:var(--color-navy-400)] hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
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
