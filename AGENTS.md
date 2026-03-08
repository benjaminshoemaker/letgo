# AGENTS.md

Project-wide workflow guidance for AI agents working in this project.

## Instruction Hierarchy

- This file is the durable, project-wide baseline.
- Initial greenfield execution guidance lives in `plans/greenfield/AGENTS.md`.
- Feature execution guidance lives in `features/<name>/AGENTS.md`.
- When working in a scoped directory, read this file first, then the local `AGENTS.md` or `CLAUDE.md` in that directory.

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
- Verify all `NEXTAUTH_*` and `GOOGLE_*` variables are set
- Check Google Cloud Console for OAuth config
- Ensure callback URLs include your domain

### R2 upload failures
- Verify all `R2_*` variables are set
- Check CORS configuration in R2 dashboard
- Verify presigned URL not expired

### AI not responding
- Verify OPENAI_API_KEY is set and valid
- Check OpenAI dashboard for usage/errors
- Verify model name is correct (gpt-5-nano)
