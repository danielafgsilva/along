"use client";

import { useState } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";

const SLIDES = [
  {
    eyebrow: "Want",
    title: "The life you still want to live",
    subtitle: "Capture every experience you dream of — in seconds.",
  },
  {
    eyebrow: "Together",
    title: "Some things are better together",
    subtitle: "Share the experiences with the people beside you.",
  },
  {
    eyebrow: "Lived",
    title: "Remember what became real",
    subtitle: "Turn plans into memories you keep for good.",
  },
] as const;

export function Onboarding() {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <form
      action={completeOnboarding}
      className="flex flex-1 flex-col px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-[max(env(safe-area-inset-top),1.5rem)]"
    >
      {/* Skip — top right, always completes so it won't show again. */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="-mr-2 rounded-full px-3 py-2 text-sm text-muted-foreground"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {slide.eyebrow}
        </p>
        <h1 className="font-serif text-4xl leading-tight tracking-tight">
          {slide.title}
        </h1>
        <p className="max-w-xs text-base text-muted-foreground">
          {slide.subtitle}
        </p>
      </div>

      {/* Progress dots */}
      <div className="mb-6 flex gap-2" aria-hidden="true">
        {SLIDES.map((s, i) => (
          <span
            key={s.eyebrow}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-1.5 bg-surface-muted"
            }`}
          />
        ))}
      </div>

      {/* Primary action */}
      {isLast ? (
        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground"
        >
          Get started
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground"
        >
          Continue
        </button>
      )}
    </form>
  );
}
