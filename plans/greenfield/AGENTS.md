# AGENTS.md

Scoped execution guidance for the initial greenfield build.

Base project rules live in `../../AGENTS.md`.

## Scope

- Run greenfield execution commands from this directory: `plans/greenfield/`
- This file applies only to the initial project build tracked by `EXECUTION_PLAN.md`.
- Feature work belongs in `../../features/<name>/`.

## Required Context

Before starting a task, read:
1. `../../AGENTS.md`
2. `PRODUCT_SPEC.md` if it exists
3. `TECHNICAL_SPEC.md` if it exists
4. `EXECUTION_PLAN.md`
5. `QUESTIONS.md` if it exists
6. `../../LEARNINGS.md` if it exists

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
