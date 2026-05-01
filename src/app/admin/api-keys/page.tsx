import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

async function createApiKey(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  if (!name) return;

  const supabase = getAdminClient();
  if (!supabase) return;

  // Generate a random 32 char hex string
  const keyStr = "jg_live_" + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  await supabase.from("api_keys").insert({ name, key: keyStr });
  revalidatePath("/admin/api-keys");
}

async function deleteApiKey(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = getAdminClient();
  if (!supabase) return;

  await supabase.from("api_keys").delete().eq("id", id);
  revalidatePath("/admin/api-keys");
}

export default async function ApiKeysPage() {
  const supabase = getAdminClient();
  if (!supabase) return <div className="p-8">No DB config.</div>;

  const { data: keys } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">API Keys</h1>
        <p className="text-sm text-[color:var(--color-navy-400)]">Kelola kunci API untuk AI Agent dan integrasi eksternal.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-[color:var(--color-cloud-200)] bg-white overflow-hidden">
          {(!keys || keys.length === 0) ? (
            <div className="p-8 text-center text-sm text-[color:var(--color-navy-400)]">Belum ada API Key.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--color-cloud-100)] text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nama</th>
                  <th className="px-5 py-4 font-semibold">Key</th>
                  <th className="px-5 py-4 font-semibold">Dibuat</th>
                  <th className="px-5 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-cloud-200)]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[color:var(--color-cloud-50)]">
                    <td className="px-5 py-4 font-medium text-[color:var(--color-navy-900)]">{k.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {k.key}
                    </td>
                    <td className="px-5 py-4 text-[color:var(--color-navy-400)]">{formatDateTime(k.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <form action={deleteApiKey}>
                        <input type="hidden" name="id" value={k.id} />
                        <button type="submit" className="p-2 text-[color:var(--color-navy-400)] hover:text-red-600 transition-colors" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-[color:var(--color-cloud-200)] bg-white p-5 h-fit">
          <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em] mb-4">Buat Key Baru</h2>
          <form action={createApiKey} className="space-y-4">
            <label className="block">
              <span className="label">Nama Integrasi</span>
              <input name="name" required placeholder="Misal: AI Agent Bot" className="input mt-1" />
            </label>
            <button type="submit" className="btn btn-primary w-full">Generate API Key</button>
          </form>
          
          <div className="mt-8 text-xs text-[color:var(--color-navy-400)] border-t border-[color:var(--color-cloud-200)] pt-4 space-y-2">
            <p><strong>Endpoint Publikasi AI Agent:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li><code>POST /api/v1/articles</code></li>
              <li><code>POST /api/v1/products</code></li>
            </ul>
            <p className="mt-2">Gunakan header:<br/><code>Authorization: Bearer &lt;Key&gt;</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
