import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;

  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[max(env(safe-area-inset-top),2rem)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col gap-1.5 text-center">
          <h1 className="font-serif text-3xl tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            {expired
              ? "That link expired. Enter your email for a new one."
              : "We'll email you a link to set a new password."}
          </p>
        </header>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-accent underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
