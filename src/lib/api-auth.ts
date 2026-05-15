import { getAdminClient } from "@/lib/supabase/admin";

export async function validateApiKey(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const key = authHeader.split(" ")[1];

  const supabase = getAdminClient();
  if (!supabase) return false;

  const { data } = await supabase.from("api_keys").select("id").eq("key", key).maybeSingle();
  return !!data;
}
