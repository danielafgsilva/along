import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  // Latest date of birth allowed (today minus 13 years), computed on the server
  // so the value is stable across hydration.
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 13);
  const maxDob = cutoff.toISOString().slice(0, 10);

  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[max(env(safe-area-inset-top),2rem)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col gap-1.5 text-center">
          <h1 className="font-serif text-3xl tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Start your list of things to live.
          </p>
        </header>

        <RegisterForm maxDob={maxDob} />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
