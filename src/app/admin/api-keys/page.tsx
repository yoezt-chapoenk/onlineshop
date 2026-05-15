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

const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th style={{ padding: "10px 16px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, color: "var(--text-muted)", textAlign: right ? "right" : "left" }}>
    {children}
  </th>
);

export default async function ApiKeysPage() {
  const supabase = getAdminClient();
  if (!supabase) return <div style={{ padding: 32, color: "var(--text-muted)" }}>No DB config.</div>;

  const { data: keys } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>API Keys</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>Kelola kunci API untuk AI Agent dan integrasi eksternal.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(0, 320px)", gap: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {(!keys || keys.length === 0) ? (
            <p style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Belum ada API Key.</p>
          ) : (
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                  <TH>Nama</TH>
                  <TH>Key</TH>
                  <TH>Dibuat</TH>
                  <TH right>Aksi</TH>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="admin-row" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text)" }}>{k.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <code style={{ fontSize: 11, fontFamily: "monospace", background: "var(--bg2)", color: "var(--gold)", padding: "2px 6px", border: "1px solid var(--border)" }}>
                        {k.key}
                      </code>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{formatDateTime(k.created_at)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <form action={deleteApiKey}>
                        <input type="hidden" name="id" value={k.id} />
                        <button type="submit" className="admin-btn-delete" title="Hapus">
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 20, height: "fit-content" }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>Buat Key Baru</h2>
          <form action={createApiKey} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "block" }}>
              <span className="label">Nama Integrasi</span>
              <input name="name" required placeholder="Misal: AI Agent Bot" className="input" style={{ marginTop: 4 }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Generate API Key</button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Endpoint AI Agent:</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <li><code style={{ fontSize: 11, color: "var(--gold)" }}>POST /api/v1/articles</code></li>
              <li><code style={{ fontSize: 11, color: "var(--gold)" }}>POST /api/v1/products</code></li>
            </ul>
            <p style={{ marginTop: 8 }}>Header: <code style={{ fontSize: 11, color: "var(--gold)" }}>Authorization: Bearer &lt;Key&gt;</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
