/**
 * One-time script to create an admin user in Supabase.
 * Run with: node scripts/create-admin.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
);

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "warungames@gmail.com";
const PASSWORD = "Boncell!234";

async function main() {
  console.log(`\n🔧 Creating admin user: ${EMAIL}`);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true, // Skip email verification
  });

  if (authError) {
    if (authError.message?.includes("already been registered")) {
      console.log("⚠️  User already exists in Auth. Skipping creation, will update role.");
    } else {
      console.error("❌ Auth error:", authError.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Auth user created:", authData.user.id);
  }

  // Set role = admin in public.users
  const { error: roleError } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("email", EMAIL);

  if (roleError) {
    console.error("❌ Failed to set admin role:", roleError.message);
    console.log("\n📋 Run this SQL manually in Supabase SQL Editor:");
    console.log(`UPDATE public.users SET role = 'admin' WHERE email = '${EMAIL}';`);
    process.exit(1);
  }

  console.log("✅ Role set to 'admin' successfully.");
  console.log(`\n🎉 Done! You can now login at /login with:`);
  console.log(`   Email   : ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`   Then go to: /admin`);
}

main();
