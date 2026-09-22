# Along

Along is a **personal life-list** app: capture the things you want to live, plan
them, live them, and keep them as memories. An item moves through three states:

**Want → Planned → Lived** (idea → plan → memory).

Adding an idea is the heart of the product and must be effortless.

---

## 1. Mobile-first is the product (non-negotiable)

**Mobile is the primary experience, not a shrunk desktop.** Design the mobile
interaction first, validate the hierarchy at ~390px, make it comfortable with
touch, and only then adapt up to tablet/desktop. Never design a desktop
dashboard and collapse it into mobile.

Assume users are: on the move, one-handed, in short sessions, remembering or
sharing something in the moment, or looking back at what they've lived.

**Rules that bind every screen and feature:**

- **Navigation:** simple bottom nav, ~3–5 destinations (starting hypothesis:
  Home · Together · Add · Lived · Profile — finalize from the real IA). No
  hamburger menus for primary areas, no desktop sidebars forced onto mobile, no
  deep nesting. Common actions = very few taps.
- **Primary action (Add):** capturing an idea must take seconds. Flow: tap `+`
  → lightweight bottom sheet/composer → type title → save. **Only Title is
  required.** Everything else (description, category, location, dates,
  collaborators, privacy, photos, reminders) is optional and progressively
  disclosed — never a long form up front. Enrich later.
- **Touch:** design for touch first. Tap targets ≥ ~44px. Never require hover to
  understand or use anything.
- **One-handed use:** keep primary actions within thumb reach; prefer bottom
  sheets, bottom nav, and docked/floating create actions over top-of-screen
  controls.
- **Sheets over modals on mobile:** bottom sheets / drawers / inline edit /
  full-screen flows on mobile; the same interaction may become a dialog,
  popover, or side panel on desktop.
- **Forms:** short and progressive. Correct input types trigger the right
  keyboard. Keep validation next to the field. **Never wipe user input on
  error.** Ensure actions/submit aren't hidden behind the software keyboard.
- **Safe areas:** respect notch / home indicator / dynamic island / PWA chrome
  via `env(safe-area-inset-*)`. `viewport-fit=cover` is already set in the root
  layout.
- **Responsive:** mobile-first Tailwind — base styles = mobile, enhance
  `sm → md → lg → xl`. Fewest breakpoints possible. Never write desktop-default
  CSS and override down.
- **Content density:** calm, not cramped. Progressive disclosure. In lists a
  card/row shows only title + one contextual detail + status + shared people;
  the rest lives in the detail view. Use cards only where they earn their place.
- **Home is not an analytics dashboard.** No KPI cards, productivity scores, or
  completion percentages. Focus: *the things I want to live* — personal and
  inspiring, not noisy.
- **Imagery:** optional for Want/Planned; gains prominence once an item is
  Lived. Don't make the UI depend on uploaded photos.
- **Gestures** enhance but never replace: every swipe action also needs an
  obvious accessible alternative. Discoverability over novelty.
- **Native-quality feel:** immediate feedback, subtle animation, clear pressed
  states, optimistic UI where safe, smooth transitions, skeleton/loading and
  empty states.
- **Performance is a product feature.** Assume slow devices and flaky networks.
  Prefer Server Components, small JS bundles, optimized/lazy images, efficient
  Supabase queries; avoid large UI libraries and unnecessary third-party
  scripts.
- **PWA:** don't build a complex PWA prematurely (YAGNI), but don't make choices
  that would block Add-to-Home-Screen / standalone / offline / push later.

**Test viewports:** 320, 375, 390, 430, 768, and desktop. Don't optimize for one
specific iPhone.

**Definition of done:** a feature isn't finished until tested on a mobile
viewport — touch targets, scroll, keyboard, focus management, safe areas,
loading/empty states, text wrapping, long titles, responsive images, bottom-nav
interaction, sheet/dialog behavior, one-handed usability. Desktop success does
**not** imply mobile success.

**Core vertical slice (build this well on mobile before investing in desktop):**
Sign in → Home → tap Add → type "See the Northern Lights" → save → see it in
Want → open item → optionally enrich → move to Planned → mark Lived → add a
memory.

---

## 2. Engineering approach

**Ponytail / YAGNI.** Reach for the laziest solution that actually works:
question whether the thing needs to exist, use the standard library and native
platform features before dependencies, one line before fifty. Don't add
abstractions, config, or packages until there's a real need. The `ponytail`
skill applies to every coding task here.

---

## 3. Stack

- **Next.js 16.3** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Auth, Postgres, Storage, RLS — via `@supabase/ssr`
- **pnpm**
- **shadcn/ui** for accessible primitives — but the app must not look like a
  shadcn template. Style intentionally (see design skills below).

**Commands:** `pnpm dev` · `pnpm build` · `pnpm lint`

**Setup:** `cp .env.local.example .env.local` and fill in the Supabase keys.

---

## 4. Next.js 16 caveats — "this is NOT the Next.js you know"

Next 16 has real breaking changes vs. older training data. Before using a Next
API, check `node_modules/next/dist/docs/` (and `@AGENTS.md`, which `next dev`
keeps updated). Specifically:

- `cookies()` (and `headers()`) are **async** — `await` them.
- **Middleware is now "Proxy":** the convention file is `src/proxy.ts` exporting
  a `proxy` function (already migrated). Don't reintroduce `middleware.ts`.
- **Cache Components** and **Partial Prefetching** are available (16.3+); use the
  `next-*` skills when adopting/optimizing them.

---

## 5. Supabase conventions

- Browser client: `src/lib/supabase/client.ts` → `createClient()`
- Server client (async): `src/lib/supabase/server.ts` → `await createClient()`
- Session refresh: `src/lib/supabase/middleware.ts` → `updateSession()`, wired
  through `src/proxy.ts`. Add auth redirects there when auth lands.
- For auth decisions in server code use `getUser()` / `getClaims()` — never
  trust `getSession()`.
- **Enable RLS on every table.** Never expose the service-role key to the client.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see
  `.env.local.example`).

---

## 6. Installed skills & tools — use them

- **ponytail** — apply on every coding task (minimal / YAGNI).
- **Context7** (MCP + `context7-mcp` skill) — pull *current* docs for
  Next/Tailwind/Supabase/etc. before writing against an API; don't rely on
  memory. (Restart Claude Code once to activate the MCP server.)
- **web-design-guidelines** (Vercel) — audit UI/UX/accessibility.
- **vercel-react-best-practices** — RSC, boundaries, composition, performance.
- **next-cache-components-\*** / **next-partial-prefetching-\*** / **next-dev-loop**
  — Next 16 adoption/optimization and runtime verification.
- **shadcn** skill + **shadcn MCP** (`.mcp.json`) — search/add components.
- **migrate-radix-to-base** — only if moving shadcn primitives to Base UI.
- **playwright-cli** — real-browser E2E; test the core mobile flow across the
  viewports above.
- **frontend-design** / **ui-ux-pro-max** — visual direction; avoid generic
  "AI slop" interfaces.
- **Security** — run a security review before releases (XSS, injection, SSRF,
  secrets, auth bypass, and especially Supabase **RLS** gaps).

@AGENTS.md
