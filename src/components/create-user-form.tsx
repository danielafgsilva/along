"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser, type CreateUserState } from "@/app/admin/users/actions";

const initialState: CreateUserState = {};

const inputClass =
  "h-12 rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none transition-colors focus:border-accent";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful create.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="new-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-sm font-medium">
          Temporary password
        </label>
        <input
          id="new-password"
          name="password"
          type="text"
          autoComplete="off"
          required
          minLength={8}
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters. Share it with the person to sign in.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-accent">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground transition-opacity disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}
