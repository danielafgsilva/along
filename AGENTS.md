<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- App dev server: `pnpm dev` (http://127.0.0.1:3000). Lint: `pnpm lint`. Production build: `pnpm build`.
- Environment start runs a local Supabase stack in Docker and writes `.env.local` (gitignored). Auth check: `curl -sS http://127.0.0.1:3000/api/health`.
- `pnpm seed` creates the local super admin from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env.local`. It is safe to run more than once.
