// Creates (or repairs) the super admin. Idempotent — safe to run repeatedly.
// Run with:  pnpm seed   (loads .env.local via node --env-file)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;

if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  process.exit(1);
}
if (!email || !password) {
  console.error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD.");
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  console.error("Could not list users:", listErr.message);
  process.exit(1);
}

const existing = list.users.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    app_metadata: { role: "super_admin" },
  });
  if (error) {
    console.error("Could not update super admin:", error.message);
    process.exit(1);
  }
  // Keep the profile row in sync (updateUserById does not fire the trigger).
  await admin
    .from("profiles")
    .upsert({ id: existing.id, email, role: "super_admin" });
  console.log(`Super admin already existed — ensured role. (${email})`);
} else {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "super_admin" },
  });
  if (error) {
    console.error("Could not create super admin:", error.message);
    process.exit(1);
  }
  console.log(`Super admin created: ${email}`);
}
