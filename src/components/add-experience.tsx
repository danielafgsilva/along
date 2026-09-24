"use client";

import { useEffect, useState, useTransition } from "react";
import { addExperience } from "@/app/experiences/actions";

export function AddExperience() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Close on Escape (desktop).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openSheet() {
    setError(null);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = String(new FormData(form).get("title") ?? "").trim();
    if (!title) return;
    startTransition(async () => {
      const res = await addExperience(title);
      if (res?.error) {
        setError(res.error);
        return;
      }
      form.reset();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-label="Add to Along"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-black/15 transition-transform active:scale-95"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Add to Along"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="relative z-10 rounded-t-[var(--radius-sheet)] bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-2xl shadow-black/20">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-muted" />
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label
                htmlFor="add-title"
                className="text-xs font-semibold uppercase tracking-widest text-accent"
              >
                Add to Along
              </label>
              <input
                autoFocus
                id="add-title"
                name="title"
                type="text"
                required
                maxLength={200}
                placeholder="Something you want to live…"
                autoComplete="off"
                enterKeyHint="done"
                className="h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-accent"
              />
              {error ? (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground transition-opacity disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
