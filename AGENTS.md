# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router pages, layouts, and global styles (`app/globals.css`).
- `lib/` holds integrations and shared clients (Supabase, Resend, membership helpers).
- `__tests__/` includes unit tests for library modules.
- `public/` stores static assets (SVGs, icons).
- Root config files include `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, and `package.json`.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server locally.
- `npm run build`: Build the production bundle.
- `npm run start`: Run the production server after build.
- `npm run lint`: Run ESLint checks.
- `npm run test`: Run Vitest test suite.

## Coding Style & Naming Conventions
- Use TypeScript for all app and library code.
- Indentation: 2 spaces (match existing code style).
- Prefer `camelCase` for variables/functions and `PascalCase` for React components.
- Keep file names lowercase with dashes where appropriate (e.g., `supabase.ts`).
- Linting is configured via `eslint.config.mjs`; follow ESLint guidance when editing.

## Testing Guidelines
- Tests use Vitest and live under `__tests__/`.
- Name tests to mirror modules, e.g., `__tests__/lib/resend.test.ts`.
- Run `npm run test` before opening a PR when possible.

## Commit & Pull Request Guidelines
- Recent commits use concise, imperative, sentence-case messages (e.g., “Implemented membership helpers”).
- Keep commits focused on a single change set.
- PRs should include a brief description of changes and testing notes (commands run).
- Add screenshots for UI changes when relevant.

## Security & Configuration Tips
- Environment variables are required for Supabase, Resend, and membership/admin configuration. Use `.env.local` for local development and keep secrets out of Git.
- Ensure API keys and secrets match their respective services.

## Agent-Specific Instructions
- Prefer `rg` for search and keep changes minimal and focused.

## Baseline workflow

- Start every task by determining:
  1. Goal + acceptance criteria.
  2. Constraints (time, safety, scope).
  3. What must be inspected (files, commands, tests, docs).
  4. Whether the request depends on **recency** (if yes, apply the "Accuracy, recency, and sourcing" rules).
  5. If requirements are ambiguous, ask targeted clarifying questions before making irreversible changes.

## Implementation steps
1. First think through the problem, read the codebase for relevant files.
2. Before you make any major changes, check in with me and I will verify the plan.
3. Please every step of the way just give me a high level explanation of what changes you made.
4. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity and maintainability.
5. Maintain a documentation file that comprehensively describes how the architecture of the app works inside and out.
6. Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.

## CONTINUITY.md (REQUIRED)

Maintain a single continuity file for the current workspace: `.agent/CONTINUITY.md`.

- `.agent/CONTINUITY.md` is a living document and canonical briefing designed to survive compaction; do not rely on earlier chat/tool output unless it's reflected there.

- At the start of each assistant turn: read `.agent/CONTINUITY.md` before acting.

### File Format

Update `.agent/CONTINUITY.md` only when there is a meaningful delta in:

  - `[PLANS]`: "Plans Log" is a guide for the next contributor as much as checklists for you.
  - `[DECISIONS]`: "Decisions Log" is used to record all decisions made.
  - `[PROGRESS]`: "Progress Log" is used to record course changes mid-implementation, documenting why and reflecting upon the implications.
  - `[DISCOVERIES]`: "Discoveries Log" is for when when you discover optimizer behavior, performance tradeoffs, unexpected bugs, or inverse/unapply semantics that shaped your approach, capture those observations with short evidence snippets (test output is ideal.
  - `[OUTCOMES]`: "Outcomes Log" is used at completion of a major task or the full plan, summarizing what was achieved, what remains, and lessons learned.

### Anti-drift / anti-bloat rules

- Facts only, no transcripts, no raw logs.
- Every entry must include:
  - a date in ISO timestamp (e.g., `2026-01-13T09:42Z`)
  - a provenance tag: `[USER]`, `[CODE]`, `[TOOL]`, `[ASSUMPTION]`
  - If unknown, write `UNCONFIRMED` (never guess). If something changes, supersede it explicitly (don't silently rewrite history).
- Keep the file bounded, short and high-signal (anti-bloat). 
- If sections begin to become bloated, compress older items into milestone (`[MILESTONE]`) bullets.

## Definition of done

A task is done when:

- the requested change is implemented or the question is answered,
  - verification is provided:
  - build attempted (when source code changed),
  - linting run (when source code changed),
  - errors/warnings addressed (or explicitly listed and agreed as out-of-scope),
  - plus tests/typecheck as applicable,
- documentation is updated exhaustively for impacted areas,
- impact is explained (what changed, where, why),
- follow-ups are listed if anything was intentionally left out.
- `.agent/CONTINUITY.md` is updated if the change materially affects goal/state/decisions.
