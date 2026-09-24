"use client";

import { useActionState, useState } from "react";
import { register, type RegisterState } from "@/app/register/actions";

const initialState: RegisterState = {};

const inputClass =
  "h-12 rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none transition-colors focus:border-accent";

export function RegisterForm({ maxDob }: { maxDob: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && confirm !== password;

  // Block paste/drop so the confirmation must be typed, not copied.
  const blockCopyFill = (e: React.ClipboardEvent | React.DragEvent) =>
    e.preventDefault();

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date_of_birth" className="text-sm font-medium">
          Date of birth
        </label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          max={maxDob}
          required
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          You must be at least 13 years old.
        </p>
      </div>

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm_password" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onPaste={blockCopyFill}
          onDrop={blockCopyFill}
          aria-invalid={mismatch}
          className={inputClass}
        />
        {mismatch ? (
          <p className="text-xs text-red-700">Passwords do not match.</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Re-type it — pasting is disabled.
          </p>
        )}
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
        disabled={pending || mismatch}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground transition-opacity disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
