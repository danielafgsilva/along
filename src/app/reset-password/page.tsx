import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Reached only with a valid recovery session (set by /auth/callback). Without
  // one, send them to request a link.
  if (!user) redirect("/forgot-password?expired=1");

  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[max(env(safe-area-inset-top),2rem)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col gap-1.5 text-center">
          <h1 className="font-serif text-3xl tracking-tight">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>
        </header>

        <ResetPasswordForm />
      </div>
    </main>
  );
}
