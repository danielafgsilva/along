"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  updateExperience,
  setLifeAreas,
  deleteExperience,
  markLived,
} from "@/app/experiences/actions";
import type { ExperienceStatus } from "@/types";

type DetailExperience = {
  id: string;
  title: string;
  status: ExperienceStatus;
  description: string | null;
  notes: string | null;
  location: string | null;
  occurred_on: string | null;
  reflection: string | null;
  lived_at: string | null;
};

type Area = { id: string; name: string };

const STATUS_LABEL: Record<ExperienceStatus, string> = {
  want: "Want",
  planned: "Planned",
  lived: "Lived",
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-accent";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
        {label}
      </h2>
      {children}
    </section>
  );
}

export function ExperienceDetail({
  experience,
  allAreas,
  selectedIds,
}: {
  experience: DetailExperience;
  allAreas: Area[];
  selectedIds: string[];
}) {
  const { id } = experience;
  const [, startTransition] = useTransition();
  const save = (patch: Parameters<typeof updateExperience>[1]) =>
    startTransition(async () => {
      await updateExperience(id, patch);
    });

  const [title, setTitle] = useState(experience.title);
  const [location, setLocation] = useState(experience.location ?? "");
  const [date, setDate] = useState(experience.occurred_on ?? "");
  const [description, setDescription] = useState(experience.description ?? "");
  const [notes, setNotes] = useState(experience.notes ?? "");
  const [reflection, setReflection] = useState(experience.reflection ?? "");
  const [areas, setAreas] = useState(new Set(selectedIds));

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  // "Plan this" sheet — all fields optional; nothing changes until Move to Planned.
  const [planning, setPlanning] = useState(false);
  const [planWhen, setPlanWhen] = useState(experience.occurred_on ?? "");
  const [planWhere, setPlanWhere] = useState(experience.location ?? "");

  useEffect(() => {
    if (!planning) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlanning(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [planning]);

  const moveToPlanned = () => {
    startTransition(async () => {
      await updateExperience(id, {
        status: "planned",
        occurred_on: planWhen || null,
        location: planWhere.trim() || null,
      });
      // Keep the inline editors in sync with what the sheet just saved.
      setDate(planWhen);
      setLocation(planWhere.trim());
      setPlanning(false);
    });
  };

  // "I lived this" → "Keep something from it" sheet. Marking lived (with an
  // optional reflection) only happens on confirm, like planning.
  const [keeping, setKeeping] = useState(false);
  const [keepReflection, setKeepReflection] = useState(
    experience.reflection ?? "",
  );

  useEffect(() => {
    if (!keeping) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setKeeping(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keeping]);

  const confirmLived = () => {
    startTransition(async () => {
      await markLived(id, keepReflection);
      setReflection(keepReflection.trim());
      setKeeping(false);
    });
  };

  const show = {
    lifeareas: areas.size > 0 || revealed.has("lifeareas"),
    location: !!experience.location || revealed.has("location"),
    date: !!experience.occurred_on || revealed.has("date"),
    description: !!experience.description || revealed.has("description"),
    notes: !!experience.notes || revealed.has("notes"),
    // Reflection belongs to the lived moment, not the "Add details" menu.
    reflection: experience.status === "lived" || !!experience.reflection,
  };

  const addable = (
    [
      ["lifeareas", "Life areas"],
      ["location", "Location"],
      ["date", "Date"],
      ["description", "Description"],
      ["notes", "Notes"],
    ] as const
  ).filter(([key]) => !show[key]);

  const reveal = (key: string) => {
    setRevealed((prev) => new Set(prev).add(key));
    setAdding(false);
  };

  const toggleArea = (areaId: string) => {
    const next = new Set(areas);
    if (next.has(areaId)) next.delete(areaId);
    else next.add(areaId);
    setAreas(next);
    startTransition(async () => {
      await setLifeAreas(id, [...next]);
    });
  };

  const onDelete = () => {
    if (!confirm("Delete this experience?")) return;
    startTransition(async () => {
      await deleteExperience(id);
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-14">
      <Link href="/" className="text-sm text-muted-foreground">
        ← Back
      </Link>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          const t = title.trim();
          if (!t) {
            setTitle(experience.title);
            return;
          }
          if (t !== experience.title) save({ title: t });
        }}
        aria-label="Title"
        className="w-full bg-transparent font-serif text-4xl leading-tight tracking-tight outline-none"
      />

      {/* Status + lifecycle action */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {STATUS_LABEL[experience.status]}
          </span>
          {experience.status === "lived" && experience.lived_at ? (
            <span className="text-xs text-muted-foreground">
              Lived {new Date(experience.lived_at).toLocaleDateString()}
            </span>
          ) : null}
          {experience.status === "want" ? (
            <button
              type="button"
              onClick={() => setPlanning(true)}
              className="ml-auto h-10 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
            >
              Plan this
            </button>
          ) : experience.status === "planned" ? (
            <button
              type="button"
              onClick={() => setKeeping(true)}
              className="ml-auto h-10 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
            >
              I lived this
            </button>
          ) : null}
        </div>
        {experience.status === "want" ? (
          <button
            type="button"
            onClick={() => setKeeping(true)}
            className="self-start text-xs text-muted-foreground underline"
          >
            I lived this already
          </button>
        ) : experience.status === "planned" ? (
          <button
            type="button"
            onClick={() => save({ status: "want" })}
            className="self-start text-xs text-muted-foreground underline"
          >
            Move back to Want
          </button>
        ) : (
          <button
            type="button"
            onClick={() => save({ status: "planned" })}
            className="self-start text-xs text-muted-foreground underline"
          >
            Move back to Planned
          </button>
        )}
      </div>

      {show.reflection ? (
        <Field label="Reflection">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            onBlur={() => {
              const v = reflection.trim() || null;
              if (v !== (experience.reflection ?? null)) save({ reflection: v });
            }}
            rows={4}
            placeholder="What do you want to keep from it?"
            className={`${inputClass} resize-none`}
          />
        </Field>
      ) : null}

      {show.lifeareas ? (
        <Field label="Life areas">
          <div className="flex flex-wrap gap-2">
            {allAreas.map((a) => {
              const on = areas.has(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleArea(a.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    on
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </Field>
      ) : null}

      {show.location ? (
        <Field label="Location">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => {
              const v = location.trim() || null;
              if (v !== (experience.location ?? null)) save({ location: v });
            }}
            placeholder="Where?"
            className={inputClass}
          />
        </Field>
      ) : null}

      {show.date ? (
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              save({ occurred_on: e.target.value || null });
            }}
            className={inputClass}
          />
        </Field>
      ) : null}

      {show.description ? (
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              const v = description.trim() || null;
              if (v !== (experience.description ?? null))
                save({ description: v });
            }}
            rows={2}
            placeholder="What is it?"
            className={`${inputClass} resize-none`}
          />
        </Field>
      ) : null}

      {show.notes ? (
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              const v = notes.trim() || null;
              if (v !== (experience.notes ?? null)) save({ notes: v });
            }}
            rows={4}
            placeholder="Anything you want to remember…"
            className={`${inputClass} resize-none`}
          />
        </Field>
      ) : null}

      {/* Progressive disclosure: only reveal more fields on request. */}
      {addable.length > 0 ? (
        adding ? (
          <div className="flex flex-wrap gap-2">
            {addable.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => reveal(key)}
                className="rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground"
              >
                + {label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="self-start text-sm font-medium text-accent"
          >
            + Add details
          </button>
        )
      ) : null}

      <button
        type="button"
        onClick={onDelete}
        className="mt-auto self-start pt-6 text-sm text-red-700"
      >
        Delete
      </button>

      {/* Plan this — progressive planning, all optional. */}
      {planning ? (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Plan this"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setPlanning(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="relative z-10 flex flex-col gap-5 rounded-t-[var(--radius-sheet)] bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-2xl shadow-black/20">
            <div className="mx-auto h-1 w-10 rounded-full bg-surface-muted" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
              Plan this
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="plan-when" className="text-sm font-medium">
                When?
              </label>
              <input
                id="plan-when"
                type="date"
                value={planWhen}
                onChange={(e) => setPlanWhen(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="plan-where" className="text-sm font-medium">
                Where?
              </label>
              <input
                id="plan-where"
                type="text"
                value={planWhere}
                onChange={(e) => setPlanWhere(e.target.value)}
                placeholder="Add a place"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="plan-with" className="text-sm font-medium">
                With?
              </label>
              <input
                id="plan-with"
                type="text"
                disabled
                placeholder="People — coming soon"
                className={`${inputClass} cursor-not-allowed opacity-60`}
              />
            </div>

            <button
              type="button"
              onClick={moveToPlanned}
              className="mt-1 flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground"
            >
              Move to Planned
            </button>
          </div>
        </div>
      ) : null}

      {/* Keep something from it — marks lived with an optional reflection. */}
      {keeping ? (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Keep something from it"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setKeeping(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="relative z-10 flex flex-col gap-5 rounded-t-[var(--radius-sheet)] bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-2xl shadow-black/20">
            <div className="mx-auto h-1 w-10 rounded-full bg-surface-muted" />
            <div className="flex flex-col gap-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
                Keep something from it
              </h2>
              <p className="text-sm text-muted-foreground">
                A reflection to remember — optional, and you can add more later.
              </p>
            </div>
            <textarea
              autoFocus
              value={keepReflection}
              onChange={(e) => setKeepReflection(e.target.value)}
              rows={5}
              placeholder="What do you want to keep from it?"
              className={`${inputClass} resize-none`}
            />
            <button
              type="button"
              onClick={confirmLived}
              className="flex h-12 items-center justify-center rounded-full bg-accent text-base font-medium text-accent-foreground"
            >
              Mark as lived
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
