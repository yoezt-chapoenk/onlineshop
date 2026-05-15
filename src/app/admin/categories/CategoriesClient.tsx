"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Category {
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export default function CategoriesClient({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [list, setList] = useState<Category[]>(initial);
  const [draft, setDraft] = useState<Category>({ slug: "", name: "", description: "", sort_order: list.length + 1 });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function update(slug: string, patch: Partial<Category>) {
    setList((cur) => cur.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
  }

  function save(c: Category) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(c.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Save failed (${res.status})`);
        return;
      }
      router.refresh();
    });
  }

  function remove(slug: string) {
    if (!confirm(`Delete category "${slug}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Delete failed (${res.status})`);
        return;
      }
      setList((cur) => cur.filter((c) => c.slug !== slug));
      router.refresh();
    });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Create failed (${res.status})`);
        return;
      }
      const j = await res.json();
      setList((cur) => [...cur, j.category as Category]);
      // Use a functional updater so the next sort_order is derived
      // from the just-submitted draft, not the stale `list` closure
      // captured at render time. After adding category #5 the next
      // draft now correctly defaults to sort_order 6 instead of 6.
      setDraft((prev) => ({
        slug: "",
        name: "",
        description: "",
        sort_order: prev.sort_order + 1,
      }));
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error ? <p style={{ fontSize: 14, color: "var(--error)" }}>{error}</p> : null}

      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px" }}>Slug</th>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Description</th>
                <th style={{ padding: "12px 16px", width: 96 }}>Order</th>
                <th style={{ padding: "12px 16px", width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                    No categories yet.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.slug} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text)" }}>{c.slug}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <input style={{ width: "100%", padding: "6px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, fontSize: 14 }} value={c.name} onChange={(e) => update(c.slug, { name: e.target.value })} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <input style={{ width: "100%", padding: "6px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, fontSize: 14 }} value={c.description} onChange={(e) => update(c.slug, { description: e.target.value })} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <input type="number" style={{ width: 80, padding: "6px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, fontSize: 14 }} value={c.sort_order} onChange={(e) => update(c.slug, { sort_order: Number(e.target.value) })} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button type="button" className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => save(c)} disabled={pending}>Save</button>
                        <button type="button" style={{ background: "transparent", border: "none", color: "var(--error)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }} onClick={() => remove(c.slug)} disabled={pending}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={add} style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, alignItems: "flex-end" }}>
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Slug</span>
          <input style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }} required value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} placeholder="eyeglasses" />
        </label>
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Name</span>
          <input style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }} required value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
        </label>
        <label style={{ display: "block", gridColumn: "span 2" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Description</span>
          <input style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }} required value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        </label>
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Sort order</span>
          <input type="number" style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }} value={draft.sort_order} onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))} />
        </label>
        <button type="submit" className="btn btn-primary" style={{ gridColumn: "1 / -1" }} disabled={pending}>+ Add category</button>
      </form>
    </div>
  );
}
