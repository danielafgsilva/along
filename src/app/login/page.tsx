import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[max(env(safe-area-inset-top),2rem)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col gap-1.5 text-center">
          <h1 className="font-serif text-4xl tracking-tight">Along</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue.</p>
        </header>

        <LoginForm />

        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-medium text-accent underline"
          >
            Forgot your password?
          </Link>
          <p>
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-accent underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
