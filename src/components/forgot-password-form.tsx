"use client";

import { useActionState } from "react";
import { requestReset, type ForgotState } from "@/app/forgot-password/actions";

const initialState: ForgotState = {};

const inputClass =
  "h-12 rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none transition-colors focus:border-accent";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestReset,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          required
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.notice ? (
        <p role="status" className="text-sm text-accent">
          {state.notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground transition-opacity disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
