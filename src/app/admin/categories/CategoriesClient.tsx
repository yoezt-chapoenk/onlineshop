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
      setDraft({ slug: "", name: "", description: "", sort_order: list.length + 2 });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-[color:var(--color-error)]">{error}</p> : null}

      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)] bg-[color:var(--color-cloud-100)]">
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 w-24">Order</th>
              <th className="px-4 py-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[color:var(--color-navy-400)]">
                  No categories yet.
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.slug} className="border-t border-[color:var(--color-cloud-200)]">
                  <td className="px-4 py-2 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-2">
                    <input className="input !py-1.5 text-sm" value={c.name} onChange={(e) => update(c.slug, { name: e.target.value })} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input !py-1.5 text-sm" value={c.description} onChange={(e) => update(c.slug, { description: e.target.value })} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" className="input !py-1.5 text-sm w-20" value={c.sort_order} onChange={(e) => update(c.slug, { sort_order: Number(e.target.value) })} />
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button type="button" className="btn btn-primary text-xs" onClick={() => save(c)} disabled={pending}>Save</button>
                    <button type="button" className="text-xs text-[color:var(--color-error)] hover:underline" onClick={() => remove(c.slug)} disabled={pending}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <label className="block">
          <span className="label">Slug</span>
          <input className="input mt-1" required value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} placeholder="eyeglasses" />
        </label>
        <label className="block">
          <span className="label">Name</span>
          <input className="input mt-1" required value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Description</span>
          <input className="input mt-1" required value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        </label>
        <label className="block">
          <span className="label">Sort order</span>
          <input type="number" className="input mt-1" value={draft.sort_order} onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))} />
        </label>
        <button type="submit" className="btn btn-primary md:col-span-5" disabled={pending}>+ Add category</button>
      </form>
    </div>
  );
}
