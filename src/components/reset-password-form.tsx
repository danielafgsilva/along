"use client";

import { useActionState, useState } from "react";
import { updatePassword, type ResetState } from "@/app/reset-password/actions";

const initialState: ResetState = {};

const inputClass =
  "h-12 rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none transition-colors focus:border-accent";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && confirm !== password;
  const blockCopyFill = (e: React.ClipboardEvent | React.DragEvent) =>
    e.preventDefault();

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          New password
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
          Confirm new password
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
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || mismatch}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground transition-opacity disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
