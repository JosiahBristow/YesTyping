# AGENTS.md

## Project

YesTyping — a bilingual (中文/EN) touch-typing learning site modeled after
typingfun.cn. React 19 + Vite 8 + TypeScript, react-router, i18next, zustand.
Core data lives in `localStorage`; optional Supabase adds login and
multiplayer (gracefully disabled when unconfigured).

## Supabase (optional)

- Credentials come from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (copy
  `.env.example` → `.env` for local dev). When unset, `supabaseConfigured`
  is `false` and auth/multiplayer surfaces show a setup notice.
- `src/lib/supabase.ts` — client + `supabaseConfigured` flag.
- `src/lib/auth.ts` — zustand auth store (`useAuth`), `displayName()`.
- `src/features/race/useRace.ts` — realtime room (presence + broadcast).
  All players type the same text via `generateSeededWords(count, seed)`.
- `src/features/race/leaderboard.ts` — `saveRaceResult` / `fetchLeaderboard`.
- DB table + RLS policies live in `supabase/schema.sql`; run it in the
  Supabase SQL Editor. CI passes the env vars from GitHub secrets
  (`.github/workflows/deploy.yml`).

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) then production build. **Run this to verify TypeScript.**
- `npm run lint` — oxlint (the template's linter, not ESLint; config in `.oxlintrc.json`)

Verify with `npm run lint && npm run build` after changes.

## Architecture

- `src/features/typing/useTypingEngine.ts` — the core input hook. Single source
  of truth for per-char state, WPM/accuracy/consistency, timer. Handles both
  `lesson` and `timed` modes (growable text via `extend`).
- `src/features/typing/TypingSession.tsx` — lesson UI; **restarts by remounting
  an inner `Engine` component via a `seed` key** (the hook does not reset on prop
  change, so remount is the only restart mechanism).
- `src/features/typing/fingerMap.ts` — key→finger map + keyboard rows. Keys are
  single lowercase letters/punctuation; `keyForChar` normalizes input (spaces →
  `space`, uppercase → lowercase, shift symbols → base key).
- `src/features/courses/` — course data as typed `Course`/`Lesson` objects with
  bilingual `{en, zh}` titles.
- `src/features/stats/useLocalStats.ts` — session persistence (localStorage key
  `yestyping.sessions.v1`).
- `src/i18n/` — UI strings in `en.json`/`zh.json`. Course content uses `Bi`
  objects + `useBi()` from `src/lib/lang.ts`, not i18next keys.

## Conventions

- **Bilingual everything**: new UI strings go in both `en.json` and `zh.json`.
  Course titles/descriptions use `Bi {en, zh}`.
- TS config enforces `verbatimModuleSyntax` (use `import type`) and
  `erasableSyntaxOnly` (no enums — use string unions). `noUnusedLocals` is on.
- `useBi`/`useLang` subscribe to the zustand language store so components
  re-render on language switch; do not read `i18n.language` directly in
  components that render `Bi` content.
- Hooks cannot be called conditionally — in `PracticePage` the `useBi`/state
  hooks run before the `!course` early return.

## Gotchas

- Modifying a session mid-run: duration tabs / lesson switching remount via
  `key`; the engine ignores `text` prop changes after mount by design.
- `pkill -f vite` matches the shell itself (command string contains "vite") and
  kills the agent shell — kill the preview server by port instead.