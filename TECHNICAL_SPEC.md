# LetGo — Technical Specification Document

**Version:** 1.0 (MVP)  
**Date:** January 2026  
**Status:** Ready for Implementation  
**Target:** AI Coding Agent

---

## Table of Contents

1. [Tech Stack Summary](#tech-stack-summary)
2. [Architecture Overview](#architecture-overview)
3. [Data Models](#data-models)
4. [API Contracts](#api-contracts)
5. [Authentication](#authentication)
6. [AI Integration](#ai-integration)
7. [Image Handling](#image-handling)
8. [State Management](#state-management)
9. [PWA Configuration](#pwa-configuration)
10. [Dependencies & Libraries](#dependencies--libraries)
11. [Environment Configuration](#environment-configuration)
12. [Edge Cases & Error Handling](#edge-cases--error-handling)
13. [Testing Strategy](#testing-strategy)
14. [Implementation Sequence](#implementation-sequence)

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL (Neon) | 16 |
| ORM | Prisma | 5.x |
| AI | OpenAI gpt-5-nano | Latest |
| Hosting | Vercel | - |
| Image Storage | Cloudflare R2 | - |
| UI Components | shadcn/ui | Latest |
| Styling | Tailwind CSS | 3.x |
| State Management | TanStack Query | 5.x |
| Auth | NextAuth.js | 4.x |
| Testing | Jest + Playwright | Latest |

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT                                     │
│                          (Next.js PWA - Mobile Web)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Camera    │  │  My Items   │  │   Auth UI   │  │  Recommendation     │ │
│  │   Capture   │  │    List     │  │  (Google)   │  │      Card           │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                     │           │
│         └────────────────┴────────────────┴─────────────────────┘           │
│                                    │                                         │
│                          React Query Cache                                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VERCEL EDGE NETWORK                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Next.js API Routes                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ POST /api/  │  │ GET/PATCH   │  │ GET /api/   │  │  GET /api/upload    │ │
│  │   scan      │  │ /api/items  │  │  auth/*     │  │  (presigned URL)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                     │           │
└─────────┼────────────────┼────────────────┼─────────────────────┼───────────┘
          │                │                │                     │
          ▼                ▼                ▼                     ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      ┌─────────────┐
   │   OpenAI    │  │    Neon     │  │   Google    │      │ Cloudflare  │
   │  gpt-5-nano │  │  PostgreSQL │  │   OAuth     │      │     R2      │
   └─────────────┘  └─────────────┘  └─────────────┘      └─────────────┘
```

### Key Components

| Component | Responsibility |
|-----------|----------------|
| **Next.js App Router** | Page routing, SSR, API routes |
| **Camera Module** | Capture photos, client-side compression |
| **Scan Service** | Orchestrates image upload → AI call → save item |
| **Items Service** | CRUD operations for user's items |
| **Auth Module** | Google OAuth via NextAuth.js |
| **AI Service** | OpenAI API integration, prompt management |
| **Upload Service** | Presigned URL generation, R2 integration |

### Request Flow: Scan Item

```
1. User captures photo
2. Client compresses image (max 1200px, 80% JPEG)
3. Client requests presigned URL from /api/upload
4. Client uploads image directly to R2
5. Client calls POST /api/scan with {imageUrl, condition}
6. Server validates user session & rate limit
7. Server calls OpenAI with image URL + prompt
8. Server parses AI response
9. Server creates Item record in database
10. Server returns recommendation to client
11. Client displays recommendation card
12. React Query caches result & invalidates items list
```

---

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// NextAuth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Application models
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime  @default(now())
  
  // Rate limiting
  scanCountToday Int      @default(0)
  scanCountDate  DateTime @default(now())

  accounts Account[]
  sessions Session[]
  items    Item[]

  @@index([email])
}

model Item {
  id                String          @id @default(cuid())
  userId            String
  
  // Image
  photoUrl          String
  
  // Identification
  identifiedName    String
  userOverrideName  String?
  condition         ItemCondition
  
  // Recommendation
  recommendation    Recommendation
  reasoning         String          @db.Text
  estimatedValueLow Int?            // cents
  estimatedValueHigh Int?           // cents
  guidance          String          @db.Text
  
  // Hazard
  isHazardous       Boolean         @default(false)
  hazardWarning     String?         @db.Text
  
  // Status tracking
  status            ItemStatus      @default(TODO)
  
  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, status])
  @@index([createdAt])
}

enum ItemCondition {
  EXCELLENT
  GOOD
  FAIR
  POOR
}

enum Recommendation {
  SELL
  DONATE
  RECYCLE
  DISPOSE
}

enum ItemStatus {
  TODO
  SOLD
  DONATED
  RECYCLED
  TRASHED
}
```

### Database Indexes

The schema includes indexes for:
- `User.email` — fast lookup during auth
- `Item.userId` — filter items by user
- `Item.userId + status` — filtered list queries
- `Item.createdAt` — sorting by date

---

## API Contracts

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://letgo-app.vercel.app/api`

### Authentication

All endpoints except `/api/auth/*` require authentication. Unauthenticated requests receive:

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

Status: `401`

### Rate Limiting

Scan endpoint is rate-limited to 50 requests/day per user. When exceeded:

```json
{
  "error": "Daily scan limit reached",
  "code": "RATE_LIMITED",
  "resetAt": "2026-01-06T00:00:00Z",
  "limit": 50,
  "remaining": 0
}
```

Status: `429`

---

### Endpoints

#### 1. GET /api/upload

Generate presigned URL for image upload.

**Request:**
```
GET /api/upload?filename=photo.jpg&contentType=image/jpeg
```

**Response (200):**
```json
{
  "uploadUrl": "https://r2.cloudflarestorage.com/letgo-images/...",
  "imageUrl": "https://images.letgo-app.com/users/abc123/items/xyz789.jpg",
  "expiresAt": "2026-01-05T12:30:00Z"
}
```

**Errors:**
- `400` — Missing filename or contentType
- `401` — Unauthorized

---

#### 2. POST /api/scan

Scan an item and get recommendation.

**Request:**
```json
{
  "imageUrl": "https://images.letgo-app.com/users/abc123/items/xyz789.jpg",
  "condition": "GOOD"
}
```

**Response (201):**
```json
{
  "item": {
    "id": "clx1234567890",
    "photoUrl": "https://images.letgo-app.com/users/abc123/items/xyz789.jpg",
    "identifiedName": "IKEA MALM 6-Drawer Dresser",
    "condition": "GOOD",
    "recommendation": "SELL",
    "reasoning": "This IKEA dresser is popular on resale markets. Similar items in good condition sell for $75-150. The MALM series is recognizable and easy to transport.",
    "estimatedValueLow": 7500,
    "estimatedValueHigh": 15000,
    "guidance": "**Where to sell:**\n1. Facebook Marketplace (fastest, local pickup)\n2. OfferUp (good for furniture)\n3. Craigslist\n\n**Listing tips:**\n- Include \"IKEA MALM\" in title\n- Photograph all 6 drawers open\n- Mention if hardware/instructions included\n- Price at $120, expect offers around $90",
    "isHazardous": false,
    "hazardWarning": null,
    "status": "TODO",
    "createdAt": "2026-01-05T12:00:00Z"
  },
  "rateLimitRemaining": 47
}
```

**Errors:**
- `400` — Invalid condition or missing imageUrl
- `401` — Unauthorized
- `422` — AI identification failed (includes fallback prompt)
- `429` — Rate limited

**422 Response (low confidence):**
```json
{
  "error": "Could not confidently identify item",
  "code": "LOW_CONFIDENCE",
  "message": "I'm not sure what this is. Can you tell me?",
  "imageUrl": "https://images.letgo-app.com/...",
  "requiresManualInput": true
}
```

---

#### 3. POST /api/scan/manual

Submit item with manual identification (fallback flow).

**Request:**
```json
{
  "imageUrl": "https://images.letgo-app.com/users/abc123/items/xyz789.jpg",
  "condition": "GOOD",
  "manualName": "Panini press"
}
```

**Response (201):** Same as `/api/scan`

---

#### 4. GET /api/items

Get user's items with optional filtering.

**Request:**
```
GET /api/items?status=TODO&limit=20&cursor=clx1234
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | all | Filter by status: TODO, SOLD, DONATED, RECYCLED, TRASHED, or "DONE" (all completed) |
| limit | number | 20 | Items per page (max 50) |
| cursor | string | null | Item ID for cursor-based pagination |

**Response (200):**
```json
{
  "items": [
    {
      "id": "clx1234567890",
      "photoUrl": "https://images.letgo-app.com/...",
      "identifiedName": "IKEA MALM 6-Drawer Dresser",
      "condition": "GOOD",
      "recommendation": "SELL",
      "reasoning": "...",
      "estimatedValueLow": 7500,
      "estimatedValueHigh": 15000,
      "guidance": "...",
      "isHazardous": false,
      "hazardWarning": null,
      "status": "TODO",
      "createdAt": "2026-01-05T12:00:00Z",
      "updatedAt": "2026-01-05T12:00:00Z"
    }
  ],
  "nextCursor": "clx0987654321",
  "hasMore": true,
  "totalCount": 45
}
```

---

#### 5. GET /api/items/[id]

Get single item details.

**Response (200):**
```json
{
  "item": { /* same as item object above */ }
}
```

**Errors:**
- `404` — Item not found or doesn't belong to user

---

#### 6. PATCH /api/items/[id]

Update item status (or override name).

**Request:**
```json
{
  "status": "SOLD"
}
```

Or:
```json
{
  "userOverrideName": "IKEA MALM 4-Drawer Dresser"
}
```

**Response (200):**
```json
{
  "item": { /* updated item object */ }
}
```

**Errors:**
- `400` — Invalid status value
- `404` — Item not found

---

#### 7. DELETE /api/items/[id]

Delete an item.

**Response (204):** No content

**Errors:**
- `404` — Item not found

---

#### 8. GET /api/user/stats

Get user's rate limit status.

**Response (200):**
```json
{
  "scansToday": 3,
  "scanLimit": 50,
  "scansRemaining": 47,
  "resetsAt": "2026-01-06T00:00:00Z"
}
```

---

## Authentication

### NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    signIn: async ({ user }) => {
      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Session Access in API Routes

```typescript
// lib/auth.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
```

---

## AI Integration

### OpenAI Client Setup

```typescript
// lib/openai.ts

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = "gpt-5-nano";
```

### Prompt Specification

```typescript
// lib/ai/scan-prompt.ts

export const SYSTEM_PROMPT = `You are an expert at identifying household items and providing actionable disposal recommendations. Your goal is to help users declutter by telling them exactly what to do with each item.

You will receive an image of an item and its condition (EXCELLENT, GOOD, FAIR, or POOR).

Respond with a JSON object containing:

1. "identifiedName": A specific, searchable name for the item (include brand if recognizable)
2. "confidence": Your confidence level (HIGH, MEDIUM, LOW)
3. "recommendation": One of SELL, DONATE, RECYCLE, or DISPOSE
4. "reasoning": 2-3 sentences explaining your recommendation
5. "estimatedValueLow": Low end of resale value in cents (null if not sellable)
6. "estimatedValueHigh": High end of resale value in cents (null if not sellable)
7. "guidance": Markdown-formatted actionable next steps
8. "isHazardous": Boolean indicating if special disposal is needed
9. "hazardWarning": If hazardous, specific warning and disposal instructions

RECOMMENDATION LOGIC:
- SELL: Item value > $20 AND condition is EXCELLENT or GOOD AND active resale market exists
- DONATE: Item is functional AND value < $20 OR high effort-to-value ratio AND commonly accepted by donation centers
- RECYCLE: Item is not functional OR in POOR condition AND material is recyclable (electronics, metal, glass, certain plastics)
- DISPOSE: Item is broken, non-functional, non-recyclable, or worn beyond use

HAZARD FLAGS (always flag these):
- Batteries (lithium, lead-acid)
- Electronics containing batteries
- Paint, solvents, chemicals
- Fluorescent/CFL bulbs
- Medications
- Propane tanks, compressed gas
- Motor oil, antifreeze
- Pesticides, herbicides
- Anything containing mercury

For SELL guidance, include:
- Recommended platforms (Facebook Marketplace, OfferUp, eBay, Craigslist)
- Suggested listing price
- Tips for photos and description

For DONATE guidance, include:
- Types of organizations that accept this item
- Mention "search Google Maps for donation centers near you"
- Note potential tax deduction

For RECYCLE guidance, include:
- How to properly prepare the item
- Suggest searching for local recycling facilities
- Special instructions if applicable

For DISPOSE guidance, include:
- Confirmation it's OK for regular trash (if true)
- Any preparation needed
- If bulky, suggest municipal bulk pickup

Respond ONLY with valid JSON. No markdown code blocks.`;

export function buildUserPrompt(condition: string, manualName?: string): string {
  let prompt = `Item condition: ${condition}`;
  if (manualName) {
    prompt += `\nUser identified this item as: ${manualName}`;
  }
  return prompt;
}
```

### AI Service

```typescript
// lib/ai/scan-service.ts

import { openai, AI_MODEL } from "@/lib/openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "./scan-prompt";

export interface ScanResult {
  identifiedName: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  recommendation: "SELL" | "DONATE" | "RECYCLE" | "DISPOSE";
  reasoning: string;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  guidance: string;
  isHazardous: boolean;
  hazardWarning: string | null;
}

export async function scanItem(
  imageUrl: string,
  condition: string,
  manualName?: string
): Promise<ScanResult> {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "high" },
          },
          {
            type: "text",
            text: buildUserPrompt(condition, manualName),
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content) as ScanResult;
  
  // Validate confidence - if LOW and no manual name, trigger fallback
  if (result.confidence === "LOW" && !manualName) {
    const error = new Error("Low confidence identification") as any;
    error.code = "LOW_CONFIDENCE";
    error.result = result;
    throw error;
  }

  return result;
}
```

### Retry Logic

```typescript
// lib/ai/retry.ts

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on LOW_CONFIDENCE - that's not a transient error
      if ((error as any).code === "LOW_CONFIDENCE") {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

---

## Image Handling

### Client-Side Compression

```typescript
// lib/image-compression.ts

import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
    initialQuality: 0.8,
  };

  return await imageCompression(file, options);
}
```

### Upload Flow

```typescript
// lib/upload.ts

export async function uploadImage(file: File): Promise<string> {
  // 1. Get presigned URL
  const presignedRes = await fetch(
    `/api/upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
  );
  
  if (!presignedRes.ok) {
    throw new Error("Failed to get upload URL");
  }
  
  const { uploadUrl, imageUrl } = await presignedRes.json();
  
  // 2. Upload directly to R2
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  
  if (!uploadRes.ok) {
    throw new Error("Failed to upload image");
  }
  
  return imageUrl;
}
```

### R2 Presigned URL Generation

```typescript
// app/api/upload/route.ts

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "@/lib/auth";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  const user = await requireAuth();
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const contentType = searchParams.get("contentType");

  if (!filename || !contentType) {
    return Response.json(
      { error: "Missing filename or contentType" },
      { status: 400 }
    );
  }

  const key = `users/${user.id}/items/${nanoid()}.jpg`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return Response.json({
    uploadUrl,
    imageUrl,
    expiresAt: new Date(Date.now() + 300 * 1000).toISOString(),
  });
}
```

---

## State Management

### React Query Setup

```typescript
// lib/query-client.ts

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys

```typescript
// lib/query-keys.ts

export const queryKeys = {
  items: {
    all: ["items"] as const,
    list: (filters: { status?: string }) => 
      ["items", "list", filters] as const,
    detail: (id: string) => ["items", "detail", id] as const,
  },
  user: {
    stats: ["user", "stats"] as const,
  },
};
```

### Hooks

```typescript
// hooks/use-items.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useItems(status?: string) {
  return useQuery({
    queryKey: queryKeys.items.list({ status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/items?${params}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: (data, { id }) => {
      // Update the item in cache
      queryClient.setQueryData(queryKeys.items.detail(id), data);
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
  });
}

export function useScanItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { imageUrl: string; condition: string }) => {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw error;
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate items list to include new item
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      // Invalidate stats to update scan count
      queryClient.invalidateQueries({ queryKey: queryKeys.user.stats });
    },
  });
}
```

### UI State Context

```typescript
// contexts/ui-context.tsx

import { createContext, useContext, useState, ReactNode } from "react";

interface UIState {
  activeFilter: "ALL" | "TODO" | "DONE";
  setActiveFilter: (filter: "ALL" | "TODO" | "DONE") => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TODO" | "DONE">("ALL");
  
  return (
    <UIContext.Provider value={{ activeFilter, setActiveFilter }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
}
```

---

## PWA Configuration

### Web Manifest

```json
// public/manifest.json

{
  "name": "LetGo - Item Disposal Helper",
  "short_name": "LetGo",
  "description": "Snap a photo. Clear the clutter. Make a better decision.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Next.js PWA Config

```javascript
// next.config.js

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
});
```

### Offline Fallback Page

```typescript
// app/offline/page.tsx

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">You're offline</h1>
      <p className="text-gray-600 text-center">
        LetGo needs an internet connection to identify items. 
        Please check your connection and try again.
      </p>
    </div>
  );
}
```

---

## Dependencies & Libraries

### package.json

```json
{
  "name": "letgo-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "next": "14.2.x",
    "react": "18.3.x",
    "react-dom": "18.3.x",
    "typescript": "5.4.x",
    
    "@prisma/client": "5.x",
    "next-auth": "4.24.x",
    "@auth/prisma-adapter": "2.x",
    
    "openai": "4.x",
    
    "@aws-sdk/client-s3": "3.x",
    "@aws-sdk/s3-request-presigner": "3.x",
    
    "@tanstack/react-query": "5.x",
    
    "browser-image-compression": "2.x",
    "nanoid": "5.x",
    "zod": "3.x",
    
    "tailwindcss": "3.4.x",
    "class-variance-authority": "0.7.x",
    "clsx": "2.x",
    "tailwind-merge": "2.x",
    "lucide-react": "0.x",
    
    "@radix-ui/react-dialog": "1.x",
    "@radix-ui/react-dropdown-menu": "2.x",
    "@radix-ui/react-select": "2.x",
    "@radix-ui/react-slot": "1.x"
  },
  "devDependencies": {
    "@types/node": "20.x",
    "@types/react": "18.x",
    "@types/react-dom": "18.x",
    
    "prisma": "5.x",
    
    "eslint": "8.x",
    "eslint-config-next": "14.x",
    
    "jest": "29.x",
    "@jest/globals": "29.x",
    "jest-environment-jsdom": "29.x",
    "@testing-library/react": "15.x",
    "@testing-library/jest-dom": "6.x",
    
    "playwright": "1.x",
    "@playwright/test": "1.x",
    
    "next-pwa": "5.x",
    "autoprefixer": "10.x",
    "postcss": "8.x"
  }
}
```

---

## Environment Configuration

### Environment Variables

```bash
# .env.example

# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Cloudflare R2
R2_ENDPOINT="https://accountid.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="letgo-images"
R2_PUBLIC_URL="https://images.letgo-app.com"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DAILY_SCAN_LIMIT="50"
```

### Vercel Environment Setup

Configure these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Environment |
|----------|-------------|
| DATABASE_URL | Production, Preview |
| DIRECT_URL | Production, Preview |
| NEXTAUTH_URL | Production (https://letgo-app.vercel.app) |
| NEXTAUTH_SECRET | Production, Preview |
| GOOGLE_CLIENT_ID | All |
| GOOGLE_CLIENT_SECRET | All |
| OPENAI_API_KEY | All |
| R2_* variables | All |
| DAILY_SCAN_LIMIT | All |

---

## Edge Cases & Error Handling

### Edge Cases Matrix

| Scenario | Handling |
|----------|----------|
| **Image too large** | Client-side compression before upload (max 1MB) |
| **Image upload fails** | Show error toast, allow retry |
| **AI times out** | Retry 2x with exponential backoff, then show text fallback |
| **AI returns low confidence** | Show text input for manual identification |
| **Multiple items in photo** | Identify dominant item only (documented in UI) |
| **Unrecognizable image** | After retries, show text fallback |
| **Invalid image format** | Client-side validation before upload, only accept JPEG/PNG/WebP |
| **User exceeds rate limit** | Show limit reached message with reset time |
| **Session expired** | NextAuth handles refresh; if truly expired, redirect to sign-in |
| **Network offline** | PWA shows offline page |
| **R2 presigned URL expires** | URLs valid for 5 min; if expired, request new one |
| **User deletes account** | Cascade delete all items and photos |
| **Concurrent status updates** | Last write wins (acceptable for MVP) |

### Error Response Format

All API errors follow consistent format:

```typescript
interface ApiError {
  error: string;       // Human-readable message
  code: string;        // Machine-readable code
  details?: unknown;   // Additional context
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid session |
| FORBIDDEN | 403 | User cannot access this resource |
| NOT_FOUND | 404 | Resource doesn't exist |
| VALIDATION_ERROR | 400 | Invalid request body |
| RATE_LIMITED | 429 | Daily scan limit exceeded |
| LOW_CONFIDENCE | 422 | AI couldn't identify item confidently |
| AI_ERROR | 502 | AI service error after retries |
| UPLOAD_FAILED | 500 | Image upload to R2 failed |

### Client-Side Error Handling

```typescript
// lib/api-client.ts

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(
      error.error || "Request failed",
      error.code || "UNKNOWN",
      res.status,
      error.details
    );
  }

  return res.json();
}
```

---

## Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── lib/
│   │   ├── image-compression.test.ts
│   │   ├── ai/scan-prompt.test.ts
│   │   └── rate-limit.test.ts
│   └── components/
│       ├── condition-selector.test.tsx
│       ├── recommendation-card.test.tsx
│       └── item-list.test.tsx
├── integration/
│   ├── api/
│   │   ├── scan.test.ts
│   │   ├── items.test.ts
│   │   └── upload.test.ts
│   └── hooks/
│       └── use-items.test.tsx
└── e2e/
    ├── auth-flow.spec.ts
    ├── scan-flow.spec.ts
    └── items-management.spec.ts
```

### Unit Tests

```typescript
// tests/unit/lib/rate-limit.test.ts

import { checkRateLimit, incrementScanCount } from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  it("should allow scan when under limit", async () => {
    const user = { scanCountToday: 5, scanCountDate: new Date() };
    const result = checkRateLimit(user, 50);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(45);
  });

  it("should block scan when at limit", async () => {
    const user = { scanCountToday: 50, scanCountDate: new Date() };
    const result = checkRateLimit(user, 50);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset count on new day", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const user = { scanCountToday: 50, scanCountDate: yesterday };
    const result = checkRateLimit(user, 50);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(50);
  });
});
```

### Integration Tests

```typescript
// tests/integration/api/scan.test.ts

import { createMocks } from "node-mocks-http";
import { POST } from "@/app/api/scan/route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "test-user-id" }),
}));

jest.mock("@/lib/ai/scan-service", () => ({
  scanItem: jest.fn().mockResolvedValue({
    identifiedName: "Test Item",
    confidence: "HIGH",
    recommendation: "DONATE",
    reasoning: "Test reasoning",
    estimatedValueLow: null,
    estimatedValueHigh: null,
    guidance: "Test guidance",
    isHazardous: false,
    hazardWarning: null,
  }),
}));

describe("POST /api/scan", () => {
  beforeEach(async () => {
    await prisma.item.deleteMany();
  });

  it("should create item and return recommendation", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        imageUrl: "https://example.com/image.jpg",
        condition: "GOOD",
      },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.item.identifiedName).toBe("Test Item");
    expect(data.item.recommendation).toBe("DONATE");
  });

  it("should reject invalid condition", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        imageUrl: "https://example.com/image.jpg",
        condition: "INVALID",
      },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(400);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/scan-flow.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Scan Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth - in real tests, use test account
    await page.goto("/");
    // ... authentication setup
  });

  test("should scan item and show recommendation", async ({ page }) => {
    // Navigate to scan
    await page.click('[data-testid="scan-button"]');
    
    // Upload image (mock file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("tests/fixtures/dresser.jpg");
    
    // Select condition
    await page.click('[data-testid="condition-good"]');
    
    // Submit
    await page.click('[data-testid="submit-scan"]');
    
    // Wait for recommendation
    await expect(page.locator('[data-testid="recommendation-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendation-type"]')).toHaveText(/SELL|DONATE|RECYCLE|DISPOSE/);
  });

  test("should handle low confidence with manual input", async ({ page }) => {
    // ... similar setup with image that triggers low confidence
    
    await expect(page.locator('[data-testid="manual-input"]')).toBeVisible();
    await page.fill('[data-testid="manual-input"]', "Panini press");
    await page.click('[data-testid="submit-manual"]');
    
    await expect(page.locator('[data-testid="recommendation-card"]')).toBeVisible();
  });

  test("should add item to My Items list", async ({ page }) => {
    // ... scan an item first
    
    await page.click('[data-testid="save-item"]');
    await page.goto("/items");
    
    await expect(page.locator('[data-testid="item-card"]')).toHaveCount(1);
  });
});
```

```typescript
// tests/e2e/items-management.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Items Management", () => {
  test("should change item status", async ({ page }) => {
    // ... setup with existing item
    
    await page.goto("/items");
    await page.click('[data-testid="item-card"]');
    await page.click('[data-testid="status-dropdown"]');
    await page.click('[data-testid="status-sold"]');
    
    await expect(page.locator('[data-testid="item-status"]')).toHaveText("SOLD");
  });

  test("should filter items by status", async ({ page }) => {
    // ... setup with multiple items in different statuses
    
    await page.goto("/items");
    await page.click('[data-testid="filter-todo"]');
    
    // Only TODO items visible
    await expect(page.locator('[data-testid="item-card"]')).toHaveCount(2);
  });
});
```

### Jest Configuration

```javascript
// jest.config.js

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};
```

### Playwright Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Implementation Sequence

This sequence is optimized for an AI coding agent to build incrementally, with each phase producing a working (if incomplete) application.

### Phase 1: Foundation (Day 1)

**Goal:** Deployable skeleton with auth

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest letgo-app --typescript --tailwind --eslint --app --src-dir=false
   ```

2. **Configure Tailwind + shadcn/ui**
   - Install shadcn/ui CLI
   - Add Button, Card, Dialog, Select, Input components

3. **Set up Prisma + Neon**
   - Initialize Prisma
   - Create schema (User, Account, Session, VerificationToken only)
   - Connect to Neon database
   - Run initial migration

4. **Configure NextAuth.js**
   - Install dependencies
   - Create auth route handler
   - Set up Google OAuth provider
   - Create sign-in page

5. **Create basic layout**
   - App shell with header
   - Protected route wrapper
   - Sign-in / Sign-out flow

6. **Deploy to Vercel**
   - Connect repository
   - Configure environment variables
   - Verify auth works in production

**Deliverable:** User can sign in with Google and see empty dashboard

---

### Phase 2: Image Upload (Day 2)

**Goal:** User can upload image and see it displayed

1. **Set up Cloudflare R2**
   - Create bucket
   - Configure CORS
   - Set up public access domain

2. **Create upload API route**
   - Generate presigned URLs
   - Validate user session

3. **Implement client-side image handling**
   - Install browser-image-compression
   - Create compression utility
   - Create upload utility

4. **Build camera/upload UI**
   - Camera capture component (using `<input type="file" capture="environment">`)
   - Upload progress indicator
   - Image preview display

5. **Add condition selector**
   - Four-option radio/button group
   - shadcn/ui Select or custom buttons

**Deliverable:** User can capture/upload image, select condition, and see preview

---

### Phase 3: AI Integration (Day 3)

**Goal:** Scan returns AI recommendation

1. **Set up OpenAI client**
   - Install SDK
   - Create client singleton

2. **Create AI prompt**
   - System prompt with full specification
   - User prompt builder

3. **Implement scan service**
   - Vision API call with JSON response format
   - Response parsing and validation
   - Retry logic with exponential backoff

4. **Create scan API route**
   - Accept imageUrl + condition
   - Call AI service
   - Handle low confidence (return 422)

5. **Add Item model to schema**
   - Full Item model with all fields
   - Run migration

6. **Save items to database**
   - Create item after successful scan
   - Return full item in response

7. **Build recommendation card UI**
   - Display identified name
   - Show recommendation badge (SELL/DONATE/RECYCLE/DISPOSE)
   - Render reasoning and guidance
   - Hazard warning banner (if applicable)
   - Estimated value display (if sellable)

**Deliverable:** User can scan item and see full recommendation

---

### Phase 4: Manual Fallback (Day 4)

**Goal:** Handle low-confidence identification gracefully

1. **Create manual scan API route**
   - Accept imageUrl + condition + manualName
   - Pass manualName to AI for guided recommendation

2. **Build fallback UI**
   - Detect 422 LOW_CONFIDENCE error
   - Show text input field
   - Submit manual identification

3. **Update scan flow**
   - Integrate fallback into main flow
   - Smooth transition between states

**Deliverable:** User can recover from failed identification

---

### Phase 5: Items List (Day 5)

**Goal:** Users can view and manage their items

1. **Create items API routes**
   - GET /api/items (list with filters)
   - GET /api/items/[id] (detail)
   - PATCH /api/items/[id] (update status)
   - DELETE /api/items/[id]

2. **Set up React Query**
   - Install TanStack Query
   - Create QueryClient provider
   - Define query keys

3. **Create items hooks**
   - useItems (list)
   - useItem (detail)
   - useUpdateItemStatus (mutation)
   - useScanItem (mutation)

4. **Build My Items page**
   - Item cards with thumbnail, name, recommendation, status
   - Filter tabs (All / To Do / Done)
   - Empty state

5. **Build item detail view**
   - Full recommendation display
   - Status dropdown to change status
   - Delete option

6. **Add navigation**
   - Bottom nav: Scan / My Items
   - Update header

**Deliverable:** Full item management flow working

---

### Phase 6: Rate Limiting (Day 6)

**Goal:** Protect against abuse

1. **Add rate limit fields to User**
   - scanCountToday
   - scanCountDate
   - Migration

2. **Create rate limit utility**
   - Check if user is within limit
   - Reset count if new day
   - Increment count on scan

3. **Integrate into scan endpoint**
   - Check limit before AI call
   - Return 429 if exceeded
   - Include remaining count in response

4. **Build rate limit UI**
   - Show remaining scans in header/dashboard
   - Show limit reached message
   - Display reset time

**Deliverable:** Users limited to 50 scans/day

---

### Phase 7: PWA & Polish (Day 7)

**Goal:** Installable, polished experience

1. **Configure PWA**
   - Install next-pwa
   - Create manifest.json
   - Add icons (192px, 512px)
   - Create offline page

2. **Add loading states**
   - Skeleton loaders for items list
   - Scan processing animation
   - Button loading states

3. **Add error handling UI**
   - Toast notifications for errors
   - Error boundaries
   - Retry buttons where appropriate

4. **Mobile optimization**
   - Test on iOS Safari and Android Chrome
   - Fix any touch/viewport issues
   - Ensure camera access works

5. **Add meta tags**
   - Open Graph tags
   - iOS web app meta tags
   - Theme color

**Deliverable:** PWA installable, polished mobile experience

---

### Phase 8: Testing (Day 8)

**Goal:** Comprehensive test coverage

1. **Set up Jest**
   - Configuration
   - Test utilities
   - Mock setup

2. **Write unit tests**
   - Rate limit logic
   - Image compression
   - AI prompt building
   - UI components

3. **Write integration tests**
   - API routes (scan, items, upload)
   - React Query hooks

4. **Set up Playwright**
   - Configuration
   - Mobile device profiles

5. **Write E2E tests**
   - Auth flow
   - Scan flow (happy path)
   - Scan flow (fallback)
   - Items management

6. **Add CI pipeline**
   - GitHub Actions workflow
   - Run tests on PR
   - Block merge on failure

**Deliverable:** Full test suite passing

---

### Phase 9: Final Review (Day 9)

1. **Security audit**
   - Verify all routes require auth
   - Check for exposed secrets
   - Validate input sanitization

2. **Performance check**
   - Lighthouse audit
   - Image optimization verification
   - Bundle size review

3. **Documentation**
   - Update README with setup instructions
   - Document environment variables
   - Add API documentation

4. **Production deployment**
   - Final environment variable check
   - Deploy to production
   - Smoke test all features

**Deliverable:** Production-ready MVP

---

## Appendix: File Structure

```
letgo-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── items/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── scan/
│   │   │   ├── route.ts
│   │   │   └── manual/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   └── user/
│   │       └── stats/
│   │           └── route.ts
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── error/
│   │       └── page.tsx
│   ├── items/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── scan/
│   │   └── page.tsx
│   ├── offline/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   ├── auth/
│   │   └── sign-in-button.tsx
│   ├── items/
│   │   ├── item-card.tsx
│   │   ├── item-list.tsx
│   │   ├── item-filters.tsx
│   │   └── status-dropdown.tsx
│   ├── scan/
│   │   ├── camera-capture.tsx
│   │   ├── condition-selector.tsx
│   │   ├── manual-input.tsx
│   │   └── recommendation-card.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── bottom-nav.tsx
│   │   └── protected-route.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── error-message.tsx
│       └── empty-state.tsx
├── contexts/
│   └── ui-context.tsx
├── hooks/
│   ├── use-items.ts
│   ├── use-scan.ts
│   ├── use-upload.ts
│   └── use-user-stats.ts
├── lib/
│   ├── ai/
│   │   ├── scan-prompt.ts
│   │   ├── scan-service.ts
│   │   └── retry.ts
│   ├── api-client.ts
│   ├── auth.ts
│   ├── image-compression.ts
│   ├── openai.ts
│   ├── prisma.ts
│   ├── query-client.ts
│   ├── query-keys.ts
│   ├── rate-limit.ts
│   ├── upload.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.json
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── setup.ts
├── .env.example
├── .env.local
├── jest.config.js
├── next.config.js
├── package.json
├── playwright.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

*This specification contains sufficient detail for an AI coding agent to implement the complete MVP. Each phase produces working functionality and can be verified before proceeding.*
