# Execution Plan: LetGo

## Overview

| Metric | Value |
|--------|-------|
| Phases | 8 |
| Steps  | 24 |
| Tasks  | 52 |

## Phase Flow

```
Phase 1: Foundation
    ↓
Phase 2: Image Upload
    ↓
Phase 3: AI Integration
    ↓
Phase 4: Manual Fallback
    ↓
Phase 5: Items List
    ↓
Phase 6: Rate Limiting
    ↓
Phase 7: PWA & Polish
    ↓
Phase 8: Testing
```

---

## Phase 1: Foundation

**Goal:** Deployable skeleton with Google OAuth authentication

### Pre-Phase Setup

Human must complete before agents begin:

- [ ] Create Neon database and obtain `DATABASE_URL` and `DIRECT_URL`
- [ ] Set up Google OAuth app in Google Cloud Console, obtain `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Generate `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- [ ] Create Vercel project and connect to Git repository
- [ ] Set environment variables in Vercel dashboard

---

### Step 1.1: Project Initialization

#### Task 1.1.A: Initialize Next.js Project

**What:** Create new Next.js project with TypeScript, Tailwind, and ESLint configuration.

**Acceptance Criteria:**
- [x] Next.js 14.x project created with App Router
- [x] TypeScript configured with strict mode
- [x] Tailwind CSS configured with default theme
- [x] ESLint configured with Next.js recommended rules
- [x] Project runs locally with `npm run dev`

**Files:**
- Create: `package.json` — project dependencies and scripts
- Create: `tsconfig.json` — TypeScript configuration
- Create: `tailwind.config.ts` — Tailwind configuration
- Create: `next.config.js` — Next.js configuration
- Create: `app/layout.tsx` — root layout
- Create: `app/page.tsx` — home page placeholder

**Depends On:** None

**Spec Reference:** Tech Stack Summary, Dependencies & Libraries

---

#### Task 1.1.B: Configure shadcn/ui

**What:** Install and configure shadcn/ui with initial components needed for MVP.

**Acceptance Criteria:**
- [x] shadcn/ui CLI initialized with default configuration
- [x] Button, Card, Dialog, Select, Input components installed
- [x] Components render correctly in a test page
- [x] `lib/utils.ts` with `cn()` helper exists

**Files:**
- Create: `components.json` — shadcn/ui configuration
- Create: `lib/utils.ts` — utility functions including cn()
- Create: `components/ui/button.tsx` — Button component
- Create: `components/ui/card.tsx` — Card component
- Create: `components/ui/dialog.tsx` — Dialog component
- Create: `components/ui/select.tsx` — Select component
- Create: `components/ui/input.tsx` — Input component

**Depends On:** Task 1.1.A

**Spec Reference:** Dependencies & Libraries

---

### Step 1.2: Database Setup

#### Task 1.2.A: Configure Prisma

**What:** Set up Prisma ORM with Neon PostgreSQL connection.

**Acceptance Criteria:**
- [x] Prisma CLI installed and initialized
- [x] Database connection successful with `npx prisma db push`
- [x] Prisma Client generated and importable
- [x] `lib/prisma.ts` exports singleton client instance

**Files:**
- Create: `prisma/schema.prisma` — empty schema with datasource config
- Create: `lib/prisma.ts` — Prisma client singleton
- Modify: `package.json` — add prisma scripts and postinstall hook

**Depends On:** Task 1.1.A

**Spec Reference:** Data Models

---

#### Task 1.2.B: Create Auth Schema

**What:** Add NextAuth.js required models to Prisma schema.

**Acceptance Criteria:**
- [x] User, Account, Session, VerificationToken models defined
- [x] All required fields and relations present per NextAuth spec
- [x] Indexes created for userId and email fields
- [x] Migration runs successfully

**Files:**
- Modify: `prisma/schema.prisma` — add auth models

**Depends On:** Task 1.2.A

**Spec Reference:** Data Models (Prisma Schema)

---

### Step 1.3: Authentication

#### Task 1.3.A: Configure NextAuth.js

**What:** Set up NextAuth.js with Google OAuth provider and Prisma adapter.

**Acceptance Criteria:**
- [x] NextAuth route handler responds at `/api/auth/*`
- [x] Google OAuth provider configured
- [x] Prisma adapter connected to database
- [x] Session callback includes user ID
- [x] `lib/auth.ts` exports `getSession` and `requireAuth` helpers

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- Create: `lib/auth.ts` — auth helper functions
- Modify: `package.json` — add next-auth and adapter dependencies

**Depends On:** Task 1.2.B

**Spec Reference:** Authentication

---

#### Task 1.3.B: Create Auth UI Pages

**What:** Build sign-in and error pages for authentication flow.

**Acceptance Criteria:**
- [x] Sign-in page displays Google sign-in button
- [x] Error page displays authentication errors gracefully
- [x] Sign-in redirects to home on success
- [x] Unauthenticated users redirected to sign-in

**Files:**
- Create: `app/auth/signin/page.tsx` — sign-in page
- Create: `app/auth/error/page.tsx` — error page
- Create: `components/auth/sign-in-button.tsx` — Google sign-in button

**Depends On:** Task 1.3.A

**Spec Reference:** Authentication

---

### Step 1.4: App Shell

#### Task 1.4.A: Create Layout Components

**What:** Build header, bottom navigation, and protected route wrapper.

**Acceptance Criteria:**
- [x] Header displays app name and user avatar when signed in
- [x] Bottom nav shows Scan and My Items buttons
- [x] ProtectedRoute redirects unauthenticated users to sign-in
- [x] Layout renders correctly on mobile viewport

**Files:**
- Create: `components/layout/header.tsx` — app header
- Create: `components/layout/bottom-nav.tsx` — bottom navigation
- Create: `components/layout/protected-route.tsx` — auth wrapper
- Modify: `app/layout.tsx` — integrate layout components

**Depends On:** Task 1.3.A, Task 1.1.B

**Spec Reference:** Core User Experience

---

#### Task 1.4.B: Create Providers

**What:** Set up React Query and session providers for the app.

**Acceptance Criteria:**
- [x] QueryClient configured with default options from spec
- [x] SessionProvider wraps the app
- [x] Providers component exports combined wrapper
- [x] No hydration errors on page load

**Files:**
- Create: `lib/query-client.ts` — React Query client configuration
- Create: `app/providers.tsx` — combined providers wrapper
- Modify: `app/layout.tsx` — wrap children with providers

**Depends On:** Task 1.3.A

**Spec Reference:** State Management

---

### Step 1.5: Deployment

#### Task 1.5.A: Deploy to Vercel

**What:** Configure and deploy application to Vercel.

**Acceptance Criteria:**
- [x] Application builds successfully on Vercel
- [x] Environment variables configured in Vercel dashboard
- [x] Google OAuth callback URLs updated for production domain
- [x] Sign-in flow works in production

**Files:**
- Modify: `next.config.js` — add any Vercel-specific config if needed

**Depends On:** Task 1.4.A, Task 1.4.B

**Spec Reference:** Environment Configuration

---

### Phase 1 Checkpoint

**Automated:**
- [x] `npm run build` succeeds
- [x] `npm run lint` passes
- [x] TypeScript compilation succeeds

**Manual Verification:**
- [x] User can sign in with Google
- [x] User sees header with their name/avatar
- [x] User sees bottom navigation
- [x] Sign out works correctly
- [x] Production deployment accessible

---

## Phase 2: Image Upload

**Goal:** User can upload/capture image and see it displayed with condition selection

### Pre-Phase Setup

Human must complete before agents begin:

- [x] Create Cloudflare R2 bucket named `letgo-images`
- [x] Configure R2 CORS policy to allow uploads from app domain
- [x] Set up R2 public access domain (or use presigned URLs for reads)
- [x] Obtain R2 credentials: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- [x] Add R2 environment variables to Vercel

---

### Step 2.1: Upload Infrastructure

#### Task 2.1.A: Create Upload API Route

**What:** Build API endpoint that generates presigned URLs for R2 uploads.

**Acceptance Criteria:**
- [x] GET `/api/upload` requires authentication
- [x] Returns presigned uploadUrl, public imageUrl, and expiresAt
- [x] Presigned URL valid for 5 minutes
- [x] File path includes user ID for scoping
- [x] Returns 400 if filename or contentType missing

**Files:**
- Create: `app/api/upload/route.ts` — presigned URL endpoint
- Modify: `package.json` — add @aws-sdk/client-s3 and s3-request-presigner

**Depends On:** Task 1.3.A

**Spec Reference:** Image Handling (R2 Presigned URL Generation)

---

#### Task 2.1.B: Create Upload Utilities

**What:** Build client-side image compression and upload functions.

**Acceptance Criteria:**
- [x] `compressImage` reduces image to max 1200px and 80% JPEG quality
- [x] `uploadImage` fetches presigned URL and uploads to R2
- [x] Upload returns public image URL on success
- [x] Compression works on JPEG, PNG, and WebP inputs

**Files:**
- Create: `lib/image-compression.ts` — compression utility
- Create: `lib/upload.ts` — upload orchestration
- Modify: `package.json` — add browser-image-compression

**Depends On:** Task 2.1.A

**Spec Reference:** Image Handling (Client-Side Compression)

---

### Step 2.2: Scan UI

#### Task 2.2.A: Create Camera Capture Component

**What:** Build component for capturing or uploading photos on mobile.

**Acceptance Criteria:**
- [x] Primary button opens camera on mobile devices
- [x] Secondary option allows file upload from gallery
- [x] Accepts only image files (JPEG, PNG, WebP)
- [x] Shows image preview after capture/selection
- [x] Preview can be dismissed to retake

**Files:**
- Create: `components/scan/camera-capture.tsx` — camera/upload component

**Depends On:** Task 1.1.B

**Spec Reference:** Core User Experience (Step 2: Capture Item)

---

#### Task 2.2.B: Create Condition Selector Component

**What:** Build 4-option condition selector with helper text.

**Acceptance Criteria:**
- [x] Four options: Excellent, Good, Fair, Poor
- [x] Each option has brief helper text
- [x] Only one option selectable at a time
- [x] Selected option visually highlighted
- [x] Returns condition enum value on selection

**Files:**
- Create: `components/scan/condition-selector.tsx` — condition selector

**Depends On:** Task 1.1.B

**Spec Reference:** Core User Experience (Step 3: Assess Condition)

---

#### Task 2.2.C: Create Scan Page

**What:** Build the main scan page combining capture and condition selection.

**Acceptance Criteria:**
- [ ] Page shows camera capture component initially
- [ ] After image captured, shows condition selector
- [ ] Submit button disabled until image and condition selected
- [ ] Shows loading state during upload
- [ ] Displays uploaded image URL (temporary, for testing)

**Files:**
- Create: `app/scan/page.tsx` — scan page
- Modify: `components/layout/bottom-nav.tsx` — link to scan page

**Depends On:** Task 2.1.B, Task 2.2.A, Task 2.2.B

**Spec Reference:** Core User Experience

---

### Phase 2 Checkpoint

**Automated:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

**Manual Verification:**
- [ ] Camera opens on mobile device
- [ ] Image can be uploaded from gallery
- [ ] Image preview displays correctly
- [ ] Condition selector works
- [ ] Image uploads to R2 successfully
- [ ] Uploaded image accessible via public URL

---

## Phase 3: AI Integration

**Goal:** Scan an item and receive AI-generated recommendation

### Pre-Phase Setup

Human must complete before agents begin:

- [ ] Obtain OpenAI API key with access to gpt-5-nano
- [ ] Add `OPENAI_API_KEY` to environment variables (local and Vercel)

---

### Step 3.1: AI Service

#### Task 3.1.A: Create OpenAI Client

**What:** Set up OpenAI SDK client singleton.

**Acceptance Criteria:**
- [ ] OpenAI client configured with API key from environment
- [ ] Client exported from `lib/openai.ts`
- [ ] AI_MODEL constant set to "gpt-5-nano"
- [ ] Client can be imported without errors

**Files:**
- Create: `lib/openai.ts` — OpenAI client setup
- Modify: `package.json` — add openai SDK

**Depends On:** Task 1.1.A

**Spec Reference:** AI Integration (OpenAI Client Setup)

---

#### Task 3.1.B: Create AI Prompt

**What:** Build system prompt and user prompt builder for item scanning.

**Acceptance Criteria:**
- [ ] System prompt includes all recommendation logic from spec
- [ ] System prompt specifies JSON response format
- [ ] System prompt includes hazard detection rules
- [ ] `buildUserPrompt` function accepts condition and optional manualName
- [ ] Prompts exported for use in scan service

**Files:**
- Create: `lib/ai/scan-prompt.ts` — prompt definitions

**Depends On:** None

**Spec Reference:** AI Integration (Prompt Specification)

---

#### Task 3.1.C: Create Scan Service

**What:** Build service that calls OpenAI with image and returns structured recommendation.

**Acceptance Criteria:**
- [ ] `scanItem` function accepts imageUrl, condition, and optional manualName
- [ ] Calls OpenAI with vision capability and JSON response format
- [ ] Parses response into typed ScanResult interface
- [ ] Throws error with code "LOW_CONFIDENCE" if confidence is LOW and no manualName
- [ ] Returns complete recommendation data

**Files:**
- Create: `lib/ai/scan-service.ts` — scan service

**Depends On:** Task 3.1.A, Task 3.1.B

**Spec Reference:** AI Integration (AI Service)

---

#### Task 3.1.D: Create Retry Utility

**What:** Build retry logic with exponential backoff for AI calls.

**Acceptance Criteria:**
- [ ] `withRetry` function retries up to 2 times
- [ ] Uses exponential backoff (1s, 2s delays)
- [ ] Does not retry on LOW_CONFIDENCE errors
- [ ] Returns result on success
- [ ] Throws last error after all retries exhausted

**Files:**
- Create: `lib/ai/retry.ts` — retry utility

**Depends On:** None

**Spec Reference:** AI Integration (Retry Logic)

---

### Step 3.2: Item Model

#### Task 3.2.A: Add Item Schema

**What:** Add Item model to Prisma schema with all fields.

**Acceptance Criteria:**
- [ ] Item model has all fields from spec (id, userId, photoUrl, etc.)
- [ ] ItemCondition, Recommendation, ItemStatus enums defined
- [ ] Foreign key relation to User with cascade delete
- [ ] Indexes on userId, userId+status, createdAt
- [ ] Migration runs successfully

**Files:**
- Modify: `prisma/schema.prisma` — add Item model and enums

**Depends On:** Task 1.2.B

**Spec Reference:** Data Models (Prisma Schema)

---

### Step 3.3: Scan API

#### Task 3.3.A: Create Scan API Route

**What:** Build POST /api/scan endpoint that processes items.

**Acceptance Criteria:**
- [ ] Requires authentication
- [ ] Validates imageUrl and condition in request body
- [ ] Calls AI scan service with retry
- [ ] Creates Item record in database on success
- [ ] Returns item data and rate limit remaining
- [ ] Returns 422 with LOW_CONFIDENCE code when AI confidence is low

**Files:**
- Create: `app/api/scan/route.ts` — scan endpoint
- Create: `lib/api-client.ts` — API error class and request helper

**Depends On:** Task 3.1.C, Task 3.1.D, Task 3.2.A

**Spec Reference:** API Contracts (POST /api/scan)

---

### Step 3.4: Recommendation UI

#### Task 3.4.A: Create Recommendation Card Component

**What:** Build component that displays AI recommendation.

**Acceptance Criteria:**
- [ ] Shows identified item name
- [ ] Displays recommendation badge (SELL/DONATE/RECYCLE/DISPOSE) with appropriate color
- [ ] Shows reasoning text
- [ ] Displays estimated value range for SELL recommendations
- [ ] Renders guidance as markdown
- [ ] Shows hazard warning banner if isHazardous is true

**Files:**
- Create: `components/scan/recommendation-card.tsx` — recommendation display

**Depends On:** Task 1.1.B

**Spec Reference:** Core User Experience (Step 5: Recommendation Card)

---

#### Task 3.4.B: Create Scan Hook

**What:** Build React Query mutation hook for scanning items.

**Acceptance Criteria:**
- [ ] `useScanItem` mutation calls POST /api/scan
- [ ] Handles loading, success, and error states
- [ ] Invalidates items list query on success
- [ ] Exposes LOW_CONFIDENCE error for fallback UI
- [ ] Returns typed scan result

**Files:**
- Create: `hooks/use-scan.ts` — scan mutation hook
- Create: `lib/query-keys.ts` — query key definitions

**Depends On:** Task 1.4.B, Task 3.3.A

**Spec Reference:** State Management (Hooks)

---

#### Task 3.4.C: Integrate Scan Flow

**What:** Connect scan page to API and display recommendation.

**Acceptance Criteria:**
- [ ] Submitting scan calls API with image URL and condition
- [ ] Shows loading state during AI processing
- [ ] Displays recommendation card on success
- [ ] Shows "Add to My Items" button after recommendation
- [ ] Handles errors with user-friendly message

**Files:**
- Modify: `app/scan/page.tsx` — integrate API and recommendation display

**Depends On:** Task 3.4.A, Task 3.4.B

**Spec Reference:** Core User Experience

---

### Phase 3 Checkpoint

**Automated:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

**Manual Verification:**
- [ ] Scan a recognizable item (e.g., a phone)
- [ ] AI identifies item correctly
- [ ] Recommendation displays with reasoning
- [ ] Value estimate shows for sellable items
- [ ] Hazard warning appears for batteries/electronics
- [ ] Item saved to database

---

## Phase 4: Manual Fallback

**Goal:** Handle low-confidence AI identification gracefully

### Pre-Phase Setup

None required.

---

### Step 4.1: Manual Input UI

#### Task 4.1.A: Create Manual Input Component

**What:** Build text input for manual item identification.

**Acceptance Criteria:**
- [ ] Text input for item name
- [ ] Submit button to retry with manual name
- [ ] Displays message explaining AI couldn't identify
- [ ] Input validation (non-empty)
- [ ] Returns manual name on submit

**Files:**
- Create: `components/scan/manual-input.tsx` — manual input component

**Depends On:** Task 1.1.B

**Spec Reference:** Core User Experience (Step 4: AI Processing fallback)

---

### Step 4.2: Manual API

#### Task 4.2.A: Create Manual Scan API Route

**What:** Build POST /api/scan/manual endpoint for fallback flow.

**Acceptance Criteria:**
- [ ] Requires authentication
- [ ] Validates imageUrl, condition, and manualName
- [ ] Calls AI scan service with manualName parameter
- [ ] Creates Item record with userOverrideName set
- [ ] Returns item data same as /api/scan

**Files:**
- Create: `app/api/scan/manual/route.ts` — manual scan endpoint

**Depends On:** Task 3.3.A

**Spec Reference:** API Contracts (POST /api/scan/manual)

---

### Step 4.3: Fallback Integration

#### Task 4.3.A: Integrate Fallback Flow

**What:** Connect manual input to scan page when AI confidence is low.

**Acceptance Criteria:**
- [ ] LOW_CONFIDENCE error triggers manual input display
- [ ] Manual submission calls /api/scan/manual
- [ ] Success shows recommendation card as normal
- [ ] User can cancel and retake photo instead
- [ ] Smooth transition between states

**Files:**
- Modify: `app/scan/page.tsx` — add fallback flow
- Modify: `hooks/use-scan.ts` — add manual scan mutation

**Depends On:** Task 4.1.A, Task 4.2.A

**Spec Reference:** Edge Cases & Error Handling

---

### Phase 4 Checkpoint

**Automated:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

**Manual Verification:**
- [ ] Scan an ambiguous/unusual item
- [ ] If LOW_CONFIDENCE, manual input appears
- [ ] Enter item name manually
- [ ] Recommendation generates successfully
- [ ] Item saved with userOverrideName

---

## Phase 5: Items List

**Goal:** Users can view and manage their saved items

### Pre-Phase Setup

None required.

---

### Step 5.1: Items API

#### Task 5.1.A: Create Items List API Route

**What:** Build GET /api/items endpoint with filtering and pagination.

**Acceptance Criteria:**
- [ ] Requires authentication
- [ ] Returns only items belonging to current user
- [ ] Supports status filter query parameter
- [ ] Supports limit and cursor pagination
- [ ] Returns items, nextCursor, hasMore, totalCount

**Files:**
- Create: `app/api/items/route.ts` — items list endpoint

**Depends On:** Task 3.2.A

**Spec Reference:** API Contracts (GET /api/items)

---

#### Task 5.1.B: Create Item Detail API Route

**What:** Build GET/PATCH/DELETE /api/items/[id] endpoints.

**Acceptance Criteria:**
- [ ] GET returns single item if owned by user
- [ ] PATCH updates status or userOverrideName
- [ ] DELETE removes item and returns 204
- [ ] All routes return 404 if item not found or not owned
- [ ] PATCH validates status enum values

**Files:**
- Create: `app/api/items/[id]/route.ts` — item detail endpoints

**Depends On:** Task 3.2.A

**Spec Reference:** API Contracts (GET/PATCH/DELETE /api/items/[id])

---

### Step 5.2: Items Hooks

#### Task 5.2.A: Create Items Hooks

**What:** Build React Query hooks for items data.

**Acceptance Criteria:**
- [ ] `useItems` fetches items list with optional status filter
- [ ] `useItem` fetches single item by ID
- [ ] `useUpdateItemStatus` mutation updates status
- [ ] `useDeleteItem` mutation deletes item
- [ ] All mutations invalidate items list queries

**Files:**
- Create: `hooks/use-items.ts` — items query and mutation hooks
- Modify: `lib/query-keys.ts` — add items query keys

**Depends On:** Task 5.1.A, Task 5.1.B

**Spec Reference:** State Management (Hooks)

---

### Step 5.3: Items UI

#### Task 5.3.A: Create Item Card Component

**What:** Build compact card for displaying item in list.

**Acceptance Criteria:**
- [ ] Shows thumbnail image
- [ ] Displays identified name
- [ ] Shows recommendation badge
- [ ] Shows current status
- [ ] Tappable to view details
- [ ] Appropriate sizing for mobile list

**Files:**
- Create: `components/items/item-card.tsx` — item card component

**Depends On:** Task 1.1.B

**Spec Reference:** Core User Experience (Step 8: My Items List)

---

#### Task 5.3.B: Create Item Filters Component

**What:** Build filter tabs for items list.

**Acceptance Criteria:**
- [ ] Three tabs: All, To Do, Done
- [ ] Done includes SOLD, DONATED, RECYCLED, TRASHED
- [ ] Active tab visually indicated
- [ ] Tapping tab updates filter
- [ ] Tab counts show number of items (optional)

**Files:**
- Create: `components/items/item-filters.tsx` — filter tabs
- Create: `contexts/ui-context.tsx` — UI state context

**Depends On:** Task 1.1.B

**Spec Reference:** Core User Experience

---

#### Task 5.3.C: Create Item List Component

**What:** Build scrollable list of item cards.

**Acceptance Criteria:**
- [ ] Renders list of ItemCard components
- [ ] Shows loading skeleton while fetching
- [ ] Shows empty state when no items
- [ ] Supports pull-to-refresh (optional)
- [ ] Handles pagination on scroll (optional for MVP)

**Files:**
- Create: `components/items/item-list.tsx` — item list component
- Create: `components/shared/empty-state.tsx` — empty state component
- Create: `components/shared/loading-spinner.tsx` — loading indicator

**Depends On:** Task 5.3.A

**Spec Reference:** Core User Experience

---

#### Task 5.3.D: Create Status Dropdown Component

**What:** Build dropdown for changing item status.

**Acceptance Criteria:**
- [ ] Shows current status
- [ ] Dropdown with options: Sold, Donated, Recycled, Trashed
- [ ] Updates status via mutation on selection
- [ ] Shows loading state during update
- [ ] Closes dropdown on selection

**Files:**
- Create: `components/items/status-dropdown.tsx` — status dropdown

**Depends On:** Task 1.1.B, Task 5.2.A

**Spec Reference:** Core User Experience

---

#### Task 5.3.E: Create My Items Page

**What:** Build the main items list page.

**Acceptance Criteria:**
- [ ] Shows filter tabs at top
- [ ] Renders item list below filters
- [ ] Filters update list content
- [ ] Protected route (requires auth)
- [ ] Links from bottom nav work

**Files:**
- Create: `app/items/page.tsx` — items list page
- Modify: `components/layout/bottom-nav.tsx` — ensure link works

**Depends On:** Task 5.2.A, Task 5.3.B, Task 5.3.C

**Spec Reference:** Core User Experience

---

#### Task 5.3.F: Create Item Detail Page

**What:** Build page showing full item details with status management.

**Acceptance Criteria:**
- [ ] Shows full-size image
- [ ] Displays complete recommendation card
- [ ] Includes status dropdown
- [ ] Delete button with confirmation
- [ ] Back navigation to list

**Files:**
- Create: `app/items/[id]/page.tsx` — item detail page

**Depends On:** Task 5.2.A, Task 5.3.D, Task 3.4.A

**Spec Reference:** Core User Experience

---

### Step 5.4: Save Flow Integration

#### Task 5.4.A: Integrate Save to My Items

**What:** Connect scan flow to items list.

**Acceptance Criteria:**
- [ ] "Add to My Items" button on recommendation card
- [ ] Button navigates to items list after save
- [ ] New item appears in items list
- [ ] Success toast/feedback shown
- [ ] Option to scan another item

**Files:**
- Modify: `app/scan/page.tsx` — add save flow and navigation

**Depends On:** Task 5.3.E

**Spec Reference:** Core User Experience (Step 7: Save & Track)

---

### Phase 5 Checkpoint

**Automated:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

**Manual Verification:**
- [ ] Items list shows saved items
- [ ] Filters work correctly
- [ ] Status can be changed
- [ ] Item detail page displays correctly
- [ ] Items can be deleted
- [ ] Save from scan adds to list

---

## Phase 6: Rate Limiting

**Goal:** Protect against abuse with daily scan limits

### Pre-Phase Setup

Human must complete before agents begin:

- [ ] Add `DAILY_SCAN_LIMIT=50` to environment variables

---

### Step 6.1: Rate Limit Logic

#### Task 6.1.A: Create Rate Limit Utility

**What:** Build rate limiting logic for scans.

**Acceptance Criteria:**
- [ ] `checkRateLimit` returns allowed, remaining, and resetAt
- [ ] Count resets at midnight (or when scanCountDate is old)
- [ ] `incrementScanCount` updates user's scan count
- [ ] Reads limit from DAILY_SCAN_LIMIT env var
- [ ] Handles edge case of first scan (no existing count)

**Files:**
- Create: `lib/rate-limit.ts` — rate limit utilities

**Depends On:** Task 1.2.B

**Spec Reference:** Edge Cases & Error Handling

---

#### Task 6.1.B: Add Rate Limit Fields to User

**What:** Add scan tracking fields to User model.

**Acceptance Criteria:**
- [ ] scanCountToday field added with default 0
- [ ] scanCountDate field added with default now()
- [ ] Migration runs successfully
- [ ] Existing users get default values

**Files:**
- Modify: `prisma/schema.prisma` — add rate limit fields to User

**Depends On:** Task 1.2.B

**Spec Reference:** Data Models

---

### Step 6.2: Rate Limit Integration

#### Task 6.2.A: Integrate Rate Limiting into Scan

**What:** Add rate limit checks to scan endpoints.

**Acceptance Criteria:**
- [ ] Check rate limit before AI call
- [ ] Return 429 with reset time if exceeded
- [ ] Increment count after successful scan
- [ ] Return remaining count in success response
- [ ] Works for both /api/scan and /api/scan/manual

**Files:**
- Modify: `app/api/scan/route.ts` — add rate limit check
- Modify: `app/api/scan/manual/route.ts` — add rate limit check

**Depends On:** Task 6.1.A, Task 6.1.B

**Spec Reference:** API Contracts

---

#### Task 6.2.B: Create User Stats API Route

**What:** Build endpoint to get user's rate limit status.

**Acceptance Criteria:**
- [ ] GET /api/user/stats requires authentication
- [ ] Returns scansToday, scanLimit, scansRemaining, resetsAt
- [ ] Handles count reset if new day

**Files:**
- Create: `app/api/user/stats/route.ts` — user stats endpoint

**Depends On:** Task 6.1.A

**Spec Reference:** API Contracts (GET /api/user/stats)

---

### Step 6.3: Rate Limit UI

#### Task 6.3.A: Create User Stats Hook

**What:** Build React Query hook for user stats.

**Acceptance Criteria:**
- [ ] `useUserStats` fetches from /api/user/stats
- [ ] Returns scansRemaining and resetTime
- [ ] Refetches after scan mutation
- [ ] Handles loading state

**Files:**
- Create: `hooks/use-user-stats.ts` — user stats hook
- Modify: `lib/query-keys.ts` — add user stats query key

**Depends On:** Task 6.2.B

**Spec Reference:** State Management

---

#### Task 6.3.B: Display Rate Limit Status

**What:** Show remaining scans and limit reached message.

**Acceptance Criteria:**
- [ ] Header or scan page shows remaining scans
- [ ] Rate limit reached shows clear message
- [ ] Message includes reset time
- [ ] Scan button disabled when limit reached
- [ ] UI updates after each scan

**Files:**
- Modify: `app/scan/page.tsx` — add rate limit display
- Create: `components/shared/rate-limit-banner.tsx` — limit banner (optional)

**Depends On:** Task 6.3.A

**Spec Reference:** Core User Experience

---

### Phase 6 Checkpoint

**Automated:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

**Manual Verification:**
- [ ] Remaining scans displays correctly
- [ ] After scanning, count decreases
- [ ] At limit, scan is blocked with message
- [ ] Reset time displayed correctly
- [ ] Count resets on new day

---

## Phase 7: PWA & Polish

**Goal:** Installable PWA with polished mobile experience

### Pre-Phase Setup

Human must complete before agents begin:

- [ ] Create app icons (192px and 512px PNG)
- [ ] Place icons in `public/icons/` directory

---

### Step 7.1: PWA Configuration

#### Task 7.1.A: Configure PWA

**What:** Set up next-pwa with manifest and service worker.

**Acceptance Criteria:**
- [ ] Web manifest with app name, icons, theme color
- [ ] Service worker registered in production
- [ ] App installable on mobile devices
- [ ] Correct start_url and display mode
- [ ] PWA disabled in development

**Files:**
- Create: `public/manifest.json` — web app manifest
- Modify: `next.config.js` — add next-pwa configuration
- Modify: `package.json` — add next-pwa dependency
- Modify: `app/layout.tsx` — add manifest link and meta tags

**Depends On:** Task 1.1.A

**Spec Reference:** PWA Configuration

---

#### Task 7.1.B: Create Offline Page

**What:** Build offline fallback page.

**Acceptance Criteria:**
- [ ] Shows friendly "you're offline" message
- [ ] Explains app needs internet for scanning
- [ ] Styled consistently with app
- [ ] Service worker serves this when offline

**Files:**
- Create: `app/offline/page.tsx` — offline page

**Depends On:** Task 7.1.A

**Spec Reference:** PWA Configuration (Offline Fallback Page)

---

### Step 7.2: Loading States

#### Task 7.2.A: Add Loading Skeletons

**What:** Add skeleton loaders for content-heavy pages.

**Acceptance Criteria:**
- [ ] Items list shows skeleton cards while loading
- [ ] Item detail shows skeleton while loading
- [ ] Scan result shows skeleton during AI processing
- [ ] Skeletons match approximate content layout

**Files:**
- Create: `components/shared/skeleton.tsx` — skeleton component
- Modify: `components/items/item-list.tsx` — add skeleton state
- Modify: `app/items/[id]/page.tsx` — add skeleton state

**Depends On:** Task 5.3.C

**Spec Reference:** Core User Experience

---

#### Task 7.2.B: Add Button Loading States

**What:** Ensure all action buttons show loading state.

**Acceptance Criteria:**
- [ ] Submit scan button shows spinner during upload/AI
- [ ] Status change shows loading state
- [ ] Delete button shows loading during deletion
- [ ] Sign-in button shows loading state

**Files:**
- Modify: `app/scan/page.tsx` — button loading states
- Modify: `components/items/status-dropdown.tsx` — loading state
- Modify: `app/items/[id]/page.tsx` — delete loading state

**Depends On:** Task 5.3.D

**Spec Reference:** Core User Experience

---

### Step 7.3: Error Handling

#### Task 7.3.A: Add Toast Notifications

**What:** Add toast system for success/error feedback.

**Acceptance Criteria:**
- [ ] Toast component or library integrated
- [ ] Success toast after saving item
- [ ] Error toast on API failures
- [ ] Toasts dismissable and auto-fade
- [ ] Positioned appropriately for mobile

**Files:**
- Create: `components/shared/toast.tsx` — toast component (or install sonner/react-hot-toast)
- Modify: `app/providers.tsx` — add toast provider if needed

**Depends On:** Task 1.4.B

**Spec Reference:** Edge Cases & Error Handling

---

#### Task 7.3.B: Add Error Boundaries

**What:** Add error boundaries for graceful failure handling.

**Acceptance Criteria:**
- [ ] Root error boundary catches unhandled errors
- [ ] Error page shows user-friendly message
- [ ] Retry button available where appropriate
- [ ] Errors logged (console for MVP)

**Files:**
- Create: `app/error.tsx` — root error page
- Create: `components/shared/error-message.tsx` — error display component

**Depends On:** Task 1.1.B

**Spec Reference:** Edge Cases & Error Handling

---

### Step 7.4: Mobile Optimization

#### Task 7.4.A: Mobile Polish

**What:** Final mobile optimizations and fixes.

**Acceptance Criteria:**
- [ ] Touch targets at least 44x44px
- [ ] No horizontal scroll on any page
- [ ] Camera input works on iOS Safari
- [ ] Camera input works on Android Chrome
- [ ] Viewport meta tag configured correctly

**Files:**
- Modify: `app/layout.tsx` — ensure viewport meta tag
- Modify: various components — adjust touch targets if needed

**Depends On:** Task 2.2.A

**Spec Reference:** Core User Experience

---

#### Task 7.4.B: Add Meta Tags

**What:** Add SEO and social meta tags.

**Acceptance Criteria:**
- [ ] Open Graph title, description, image
- [ ] iOS web app meta tags
- [ ] Theme color meta tag
- [ ] Favicon configured

**Files:**
- Modify: `app/layout.tsx` — add meta tags
- Create: `public/favicon.ico` — favicon (or use existing)

**Depends On:** Task 1.1.A

**Spec Reference:** PWA Configuration

---

### Phase 7 Checkpoint

**Automated:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Lighthouse PWA audit passes (core checks)

**Manual Verification:**
- [ ] App installable on iOS
- [ ] App installable on Android
- [ ] Offline page shows when disconnected
- [ ] Loading skeletons appear appropriately
- [ ] Toasts display on actions
- [ ] No mobile UI issues

---

## Phase 8: Testing

**Goal:** Comprehensive test coverage for CI/CD

### Pre-Phase Setup

None required.

---

### Step 8.1: Test Setup

#### Task 8.1.A: Configure Jest

**What:** Set up Jest for unit and integration testing.

**Acceptance Criteria:**
- [ ] Jest configured for TypeScript
- [ ] jsdom environment for component tests
- [ ] Module path aliases working
- [ ] Setup file for test utilities
- [ ] Coverage reporting configured

**Files:**
- Create: `jest.config.js` — Jest configuration
- Create: `tests/setup.ts` — test setup file
- Modify: `package.json` — add test scripts

**Depends On:** Task 1.1.A

**Spec Reference:** Testing Strategy

---

#### Task 8.1.B: Configure Playwright

**What:** Set up Playwright for E2E testing.

**Acceptance Criteria:**
- [ ] Playwright configured for mobile Chrome and Safari
- [ ] Base URL configured for local dev server
- [ ] Web server command configured
- [ ] HTML reporter enabled

**Files:**
- Create: `playwright.config.ts` — Playwright configuration
- Modify: `package.json` — add e2e test script

**Depends On:** Task 1.1.A

**Spec Reference:** Testing Strategy (Playwright Configuration)

---

### Step 8.2: Unit Tests

#### Task 8.2.A: Rate Limit Unit Tests

**What:** Write unit tests for rate limiting logic.

**Acceptance Criteria:**
- [ ] Test allows scan when under limit
- [ ] Test blocks scan when at limit
- [ ] Test resets count on new day
- [ ] Test handles first scan (no existing count)
- [ ] All tests pass

**Files:**
- Create: `tests/unit/lib/rate-limit.test.ts` — rate limit tests

**Depends On:** Task 8.1.A, Task 6.1.A

**Spec Reference:** Testing Strategy (Unit Tests)

---

#### Task 8.2.B: Image Compression Unit Tests

**What:** Write unit tests for image compression utility.

**Acceptance Criteria:**
- [ ] Test compresses large images
- [ ] Test respects max dimension setting
- [ ] Test handles different input formats
- [ ] Mock browser-image-compression appropriately
- [ ] All tests pass

**Files:**
- Create: `tests/unit/lib/image-compression.test.ts` — compression tests

**Depends On:** Task 8.1.A, Task 2.1.B

**Spec Reference:** Testing Strategy

---

#### Task 8.2.C: AI Prompt Unit Tests

**What:** Write unit tests for prompt building functions.

**Acceptance Criteria:**
- [ ] Test buildUserPrompt with condition only
- [ ] Test buildUserPrompt with condition and manualName
- [ ] Test system prompt contains required elements
- [ ] All tests pass

**Files:**
- Create: `tests/unit/lib/ai/scan-prompt.test.ts` — prompt tests

**Depends On:** Task 8.1.A, Task 3.1.B

**Spec Reference:** Testing Strategy

---

#### Task 8.2.D: Component Unit Tests

**What:** Write unit tests for key UI components.

**Acceptance Criteria:**
- [ ] ConditionSelector renders all options and handles selection
- [ ] RecommendationCard renders all recommendation types
- [ ] RecommendationCard shows hazard warning when appropriate
- [ ] ItemCard renders item data correctly
- [ ] All tests pass

**Files:**
- Create: `tests/unit/components/condition-selector.test.tsx`
- Create: `tests/unit/components/recommendation-card.test.tsx`
- Create: `tests/unit/components/item-card.test.tsx`

**Depends On:** Task 8.1.A, Task 2.2.B, Task 3.4.A, Task 5.3.A

**Spec Reference:** Testing Strategy

---

### Step 8.3: Integration Tests

#### Task 8.3.A: Scan API Integration Tests

**What:** Write integration tests for scan endpoints.

**Acceptance Criteria:**
- [ ] Test successful scan creates item
- [ ] Test rejects invalid condition
- [ ] Test requires authentication
- [ ] Test returns 422 on low confidence
- [ ] Mock OpenAI appropriately
- [ ] All tests pass

**Files:**
- Create: `tests/integration/api/scan.test.ts` — scan API tests

**Depends On:** Task 8.1.A, Task 3.3.A

**Spec Reference:** Testing Strategy (Integration Tests)

---

#### Task 8.3.B: Items API Integration Tests

**What:** Write integration tests for items endpoints.

**Acceptance Criteria:**
- [ ] Test list returns user's items only
- [ ] Test filtering by status works
- [ ] Test update status works
- [ ] Test delete works
- [ ] Test 404 for non-existent items
- [ ] All tests pass

**Files:**
- Create: `tests/integration/api/items.test.ts` — items API tests

**Depends On:** Task 8.1.A, Task 5.1.A, Task 5.1.B

**Spec Reference:** Testing Strategy

---

#### Task 8.3.C: React Query Hooks Integration Tests

**What:** Write integration tests for data hooks.

**Acceptance Criteria:**
- [ ] Test useItems fetches and caches data
- [ ] Test useUpdateItemStatus invalidates cache
- [ ] Test useScanItem handles success and error
- [ ] Mock fetch appropriately
- [ ] All tests pass

**Files:**
- Create: `tests/integration/hooks/use-items.test.tsx` — hooks tests

**Depends On:** Task 8.1.A, Task 5.2.A

**Spec Reference:** Testing Strategy

---

### Step 8.4: E2E Tests

#### Task 8.4.A: Auth Flow E2E Test

**What:** Write E2E test for authentication flow.

**Acceptance Criteria:**
- [ ] Test sign-in redirects to Google (or mock)
- [ ] Test authenticated user sees dashboard
- [ ] Test unauthenticated user redirected to sign-in
- [ ] Test sign-out works
- [ ] Test runs on mobile viewports

**Files:**
- Create: `tests/e2e/auth-flow.spec.ts` — auth E2E test

**Depends On:** Task 8.1.B

**Spec Reference:** Testing Strategy (E2E Tests)

---

#### Task 8.4.B: Scan Flow E2E Test

**What:** Write E2E test for complete scan flow.

**Acceptance Criteria:**
- [ ] Test upload image and select condition
- [ ] Test submit and see recommendation
- [ ] Test save to my items
- [ ] Test handles low confidence fallback
- [ ] Uses fixture images for consistent testing

**Files:**
- Create: `tests/e2e/scan-flow.spec.ts` — scan E2E test
- Create: `tests/fixtures/` — test images

**Depends On:** Task 8.1.B

**Spec Reference:** Testing Strategy (E2E Tests)

---

#### Task 8.4.C: Items Management E2E Test

**What:** Write E2E test for items list and management.

**Acceptance Criteria:**
- [ ] Test view items list
- [ ] Test filter by status
- [ ] Test change item status
- [ ] Test delete item
- [ ] Test runs on mobile viewports

**Files:**
- Create: `tests/e2e/items-management.spec.ts` — items E2E test

**Depends On:** Task 8.1.B

**Spec Reference:** Testing Strategy (E2E Tests)

---

### Step 8.5: CI Pipeline

#### Task 8.5.A: Create GitHub Actions Workflow

**What:** Set up CI pipeline for automated testing.

**Acceptance Criteria:**
- [ ] Workflow runs on pull requests
- [ ] Runs lint, type check, and tests
- [ ] Runs E2E tests with Playwright
- [ ] Blocks merge on failure
- [ ] Caches dependencies for speed

**Files:**
- Create: `.github/workflows/ci.yml` — CI workflow

**Depends On:** Task 8.4.C

**Spec Reference:** Testing Strategy

---

### Phase 8 Checkpoint

**Automated:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] CI pipeline green

**Manual Verification:**
- [ ] Review test coverage
- [ ] Confirm critical paths tested
- [ ] CI runs on a test PR

---

## Final Review Checklist

Before declaring MVP complete:

**Security:**
- [ ] All routes require authentication
- [ ] No secrets in client code
- [ ] Input validation on all endpoints
- [ ] Images scoped to user directories

**Performance:**
- [ ] Lighthouse mobile score > 80
- [ ] Images compressed before upload
- [ ] React Query caching working

**Documentation:**
- [ ] README updated with setup instructions
- [ ] Environment variables documented
- [ ] API endpoints documented (in spec)

**Production:**
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Smoke test all features manually
