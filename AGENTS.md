# AGENTS.md

Project-wide guidance for AI agents working on Letgo.

## Project context

- Stack: TypeScript, Node.js, Next.js App Router, PostgreSQL on Neon, Prisma,
  Jest, Playwright, and npm.
- Run `npm run dev` for local development at `http://localhost:3000`.
- Application code is organized under `app/`, `components/`, `hooks/`, `lib/`,
  `prisma/`, and `tests/`.
- Existing plans are historical product context, not a mandatory workflow.

## Working rules

- Make the smallest change that satisfies the request and follow existing patterns.
- Do not duplicate files as a workaround, guess requirements, or modify unrelated
  files without calling it out.
- Flag new dependencies and preserve existing environment-variable boundaries.
- Never use placeholder credentials. Report missing access or configuration.
- Add or update tests for behavior changes and run relevant lint, build, unit,
  and end-to-end checks before reporting completion.
- Record out-of-scope ideas and technical debt in `TODOS.md` without silently
  expanding the task.

Treat instruction, automation, CI, authentication, data, storage, AI, and
security files as high-impact configuration. Git history is the recovery path
for retired workflow material.
