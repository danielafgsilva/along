"use client";

import { useState } from "react";
import Link from "next/link";
import type { ExperienceStatus } from "@/types";

type Area = { slug: string; name: string };
type Item = {
  id: string;
  title: string;
  status: ExperienceStatus;
  location: string | null;
  areas: Area[];
};

const STATUS_ORDER: ExperienceStatus[] = ["want", "planned", "lived"];
const STATUS_LABEL: Record<ExperienceStatus, string> = {
  want: "Want",
  planned: "Planned",
  lived: "Lived",
};

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-muted-foreground"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Pin() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ item }: { item: Item }) {
  const area = item.areas[0]?.name ?? null;
  return (
    <li>
      <Link
        href={`/experiences/${item.id}`}
        className="flex items-center justify-between gap-3 py-4"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-medium text-foreground">
            {item.title}
          </span>
          {area || item.location ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {area ? (
                <span className="uppercase tracking-wide">{area}</span>
              ) : null}
              {item.location ? (
                <span className="flex items-center gap-1">
                  <Pin />
                  {item.location}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
        <ChevronRight />
      </Link>
    </li>
  );
}

export function HomeExperiences({
  items,
  areas,
}: {
  items: Item[];
  areas: Area[];
}) {
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState<"all" | ExperienceStatus>("all");

  const byArea =
    area === "all"
      ? items
      : items.filter((i) => i.areas.some((a) => a.slug === area));

  const shownStatuses = status === "all" ? STATUS_ORDER : [status];
  const groups = shownStatuses
    .map((s) => ({ status: s, items: byArea.filter((i) => i.status === s) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Life-area filter — horizontal, edge-to-edge scroll. */}
      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
        <Chip label="All" active={area === "all"} onClick={() => setArea("all")} />
        {areas.map((a) => (
          <Chip
            key={a.slug}
            label={a.name}
            active={area === a.slug}
            onClick={() => setArea(a.slug)}
          />
        ))}
      </div>

      {/* Status filter. */}
      <div className="flex flex-wrap gap-2">
        <Chip
          label="All"
          active={status === "all"}
          onClick={() => setStatus("all")}
        />
        {STATUS_ORDER.map((s) => (
          <Chip
            key={s}
            label={STATUS_LABEL[s]}
            active={status === s}
            onClick={() => setStatus(s)}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col gap-2 py-10 text-center">
          <p className="font-serif text-2xl">Your list is empty</p>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            The things you want to live will show up here.
          </p>
        </div>
      ) : groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing matches this filter.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <section key={g.status} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {STATUS_LABEL[g.status]}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {g.items.length}
                </span>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {g.items.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
