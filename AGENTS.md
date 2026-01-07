# AGENTS.md

Workflow guidelines for AI agents executing tasks from EXECUTION_PLAN.md.

---

## Project Context

**Tech Stack:**
- Language: TypeScript 5.x
- Runtime: Node.js 20.x
- Framework: Next.js 14.x (App Router)
- Database: PostgreSQL 16 (Neon)
- ORM: Prisma 5.x
- Test Runner: Jest (unit/integration), Playwright (E2E)
- Package Manager: npm

**Dev Server:** `npm run dev` → `http://localhost:3000` (wait 5s for startup)

---

## Workflow

```
HUMAN (Orchestrator)
├── Completes pre-phase setup
├── Assigns tasks from EXECUTION_PLAN.md
├── Reviews and approves at phase checkpoints

AGENT (Executor)
├── Executes one task at a time
├── Works in git branch
├── Follows TDD: tests first, then implementation
├── Runs verification against acceptance criteria
└── Reports completion or blockers
```

---

## Task Execution

1. **Load context** — Read AGENTS.md, TECHNICAL_SPEC.md, and your task from EXECUTION_PLAN.md
2. **Check CLAUDE.md** — Read project root CLAUDE.md if it exists
3. **Verify dependencies** — Confirm prior tasks are complete by checking for expected files/exports
4. **Write tests first** — One test per acceptance criterion (when applicable)
5. **Implement** — Minimum code to pass tests and satisfy acceptance criteria
6. **Verify** — Run all tests, confirm acceptance criteria met
7. **Update progress** — Check off completed acceptance criteria in EXECUTION_PLAN.md
8. **Commit** — Format: `task(1.1.A): brief description`

---

## Context Management

**Start fresh for each task.** Do not carry conversation history between tasks.

Before starting any task, load:
1. AGENTS.md (this file)
2. TECHNICAL_SPEC.md
3. Your task definition from EXECUTION_PLAN.md

**Preserve context while debugging.** If tests fail within a task, continue in the same conversation until resolved.

```
Task N starts (fresh)
    → Write tests (if applicable)
    → Implement
    → Tests fail → Debug (keep context) → Fix
    → Tests pass
    → Task complete
Task N+1 starts (fresh)
```

---

## Testing Policy

**When to write tests:**
- Phase 8 tasks: Always (this is the testing phase)
- API routes: Write tests in Phase 8, not during initial implementation
- Utility functions: Write tests in Phase 8
- UI components: Write tests in Phase 8
- Pre-Phase 8: Focus on implementation, verify manually

**Test rules:**
- All tests must pass before reporting complete
- Never skip or disable tests to make them pass
- Never claim "working" when functionality is broken
- Read full error output before attempting fixes
- Run `npm run lint` and `npm run build` to catch type errors

**Verification commands:**
```bash
npm run lint          # Check for lint errors
npm run build         # Type check and build
npm test              # Run Jest tests (Phase 8+)
npm run test:e2e      # Run Playwright tests (Phase 8+)
```

---

## When to Stop and Ask

Stop and ask the human if:
- A dependency is missing (file, function, service doesn't exist)
- You need environment variables or secrets not yet configured
- Acceptance criteria are ambiguous or contradictory
- A test fails and you cannot determine why after reading full error output
- You need to modify files outside your task scope
- The spec doesn't cover a scenario you've encountered
- You discover a security concern

**Blocker format:**
```
BLOCKED: Task {id}
Issue: {what's wrong}
Tried: {what you attempted}
Need: {what would unblock}
```

---

## Completion Report

When done with a task, report:

```
COMPLETE: Task {id}

What was built:
{1-2 sentence summary}

Files created:
- {path}
- {path}

Files modified:
- {path}

Verification:
- npm run build: ✓
- npm run lint: ✓
- Manual test: {what you verified}

Commit: {hash or "ready to commit"}
```

---

## Git Conventions

| Item | Format |
|------|--------|
| Branch | `task-{id}` (e.g., `task-1.1.A`) |
| Commit | `task({id}): {description}` (e.g., `task(1.1.A): initialize next.js project`) |

**Branch workflow:** Create a fresh `task-{id}` branch from the latest `main` before making changes for a task, and keep one task per branch.

**Commit frequency:** One commit per task, after all acceptance criteria met.

---

## Guardrails

### Do
- Make the smallest change that satisfies acceptance criteria
- Read existing code before writing new code
- Follow patterns established in the codebase
- Check the spec when unsure about requirements
- Verify your work compiles and lints before reporting complete

### Don't
- Duplicate files to work around issues — fix the original
- Guess at requirements — ask if unclear
- Introduce new dependencies without checking the spec
- Modify files outside your task scope without flagging
- Skip verification steps to save time
- Leave TODO comments without adding to TODOS.md

---

## Key File Locations

Reference these when implementing:

| Purpose | Location |
|---------|----------|
| API Routes | `app/api/**` |
| Pages | `app/**/page.tsx` |
| Components | `components/**` |
| Hooks | `hooks/**` |
| Utilities | `lib/**` |
| AI Logic | `lib/ai/**` |
| Prisma Schema | `prisma/schema.prisma` |
| Tests | `tests/**` |

---

## Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Run ESLint

# Database
npx prisma db push            # Push schema to database
npx prisma migrate dev        # Create and run migration
npx prisma generate           # Generate Prisma client
npx prisma studio             # Open database GUI

# Testing
npm test                       # Run Jest tests
npm run test:watch            # Jest in watch mode
npm run test:e2e              # Run Playwright tests

# shadcn/ui
npx shadcn-ui@latest add {component}  # Add new component
```

---

## Environment Variables

Tasks may need these (human sets up in pre-phase):

```bash
# Database
DATABASE_URL          # Neon connection string
DIRECT_URL            # Neon direct connection

# Auth
NEXTAUTH_URL          # App URL
NEXTAUTH_SECRET       # Random secret
GOOGLE_CLIENT_ID      # Google OAuth
GOOGLE_CLIENT_SECRET  # Google OAuth

# AI
OPENAI_API_KEY        # OpenAI API key

# Storage
R2_ENDPOINT           # Cloudflare R2 endpoint
R2_ACCESS_KEY_ID      # R2 access key
R2_SECRET_ACCESS_KEY  # R2 secret
R2_BUCKET_NAME        # R2 bucket
R2_PUBLIC_URL         # R2 public URL

# App
DAILY_SCAN_LIMIT      # Rate limit (default: 50)
```

If a variable is missing, **stop and ask** — do not use placeholder values.

---

## Follow-Up Items (TODOS.md)

During development, you will discover items that need attention but are outside the current task scope: refactoring opportunities, edge cases to handle later, documentation needs, technical debt, etc.

**When you identify a follow-up item:**

1. **Prompt the human to start TODOS.md** if it doesn't exist:
   ```
   I've identified a follow-up item: {description}

   Should I create TODOS.md to track this and future items?
   ```

2. **Add items to TODOS.md** with context:
   ```markdown
   ## TODO: {Brief title}
   - **Source:** Task {id} or {file:line}
   - **Description:** {What needs to be done}
   - **Priority:** {Suggested: High/Medium/Low}
   - **Added:** {Date}
   ```

3. **Prompt for prioritization** when the list grows or at phase checkpoints:
   ```
   TODOS.md now has {N} items. Would you like to:
   - Review and prioritize them?
   - Add any to the current phase?
   - Defer to a future phase?
   ```

**Do not** silently ignore discovered issues. **Do not** scope-creep by fixing them without approval. Track them in TODOS.md and let the human decide when to address them.

---

## Phase-Specific Notes

### Phase 1: Foundation
- Focus on getting auth working end-to-end
- Verify Google OAuth in production before moving on
- Database should be empty but accessible

### Phase 2: Image Upload
- Test camera on actual mobile device
- Verify R2 uploads work before moving on
- Check both iOS Safari and Android Chrome

### Phase 3: AI Integration
- AI responses may vary — focus on structure, not exact content
- Test with real images, not just fixtures
- Verify hazard detection with battery/electronics images

### Phase 4: Manual Fallback
- Test with genuinely ambiguous items
- Ensure fallback flow is smooth, not jarring

### Phase 5: Items List
- Test pagination if list grows large
- Verify filters work correctly
- Check status transitions

### Phase 6: Rate Limiting
- Test limit actually blocks at 50
- Verify count resets at midnight
- Don't forget to test both scan endpoints

### Phase 7: PWA & Polish
- Test PWA install on real devices
- Check offline behavior
- Run Lighthouse audit

### Phase 8: Testing
- Mock external services (OpenAI, R2)
- Use test database for integration tests
- E2E tests need auth handling (mock or test account)

---

## Troubleshooting

### "Module not found" errors
- Run `npm install`
- Run `npx prisma generate`
- Check import paths match file structure

### Database connection errors
- Verify DATABASE_URL is set
- Check Neon dashboard for connection issues
- Try `npx prisma db push` to verify connection

### Auth not working
- Verify all NEXTAUTH_* and GOOGLE_* variables set
- Check Google Cloud Console for OAuth config
- Ensure callback URLs include your domain

### R2 upload failures
- Verify all R2_* variables set
- Check CORS configuration in R2 dashboard
- Verify presigned URL not expired

### AI not responding
- Verify OPENAI_API_KEY is set and valid
- Check OpenAI dashboard for usage/errors
- Verify model name is correct (gpt-5-nano)
