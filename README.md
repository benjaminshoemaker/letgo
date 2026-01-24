# LetGo

A mobile-first PWA that helps users decide what to do with household items during decluttering. Snap a photo, get AI-powered recommendations to sell, donate, recycle, or dispose.

## Features

- **AI Item Scanning**: Take a photo and get instant recommendations
- **Smart Recommendations**: Sell, donate, recycle, or dispose suggestions with reasoning
- **Value Estimates**: Price ranges for sellable items
- **Hazard Detection**: Warnings for items requiring special disposal
- **Item Tracking**: Manage your decluttering progress
- **PWA Support**: Install on mobile for native-like experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js with Google OAuth
- **AI**: OpenAI GPT-4o
- **Storage**: Cloudflare R2
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 20.x
- npm
- PostgreSQL database (recommend [Neon](https://neon.tech))
- Google Cloud project for OAuth
- OpenAI API key
- Cloudflare R2 bucket

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
OPENAI_API_KEY="sk-your-openai-key"

# Storage (Cloudflare R2)
R2_ENDPOINT="https://account-id.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-public-bucket-url.com"

# App Settings
DAILY_SCAN_LIMIT="50"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### Cloudflare R2 Setup

1. Create an R2 bucket in Cloudflare dashboard
2. Create API token with R2 read/write permissions
3. Configure CORS for your domain
4. Optionally set up a custom domain for public access

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Run type check
npm run build

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Database Commands

```bash
# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev

# Open database GUI
npx prisma studio
```

## Deployment

The app is configured for deployment on [Vercel](https://vercel.com):

1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # NextAuth handlers
│   ├── items/        # Item CRUD endpoints
│   ├── scan/         # AI scanning endpoints
│   ├── upload/       # Image upload (presigned URLs)
│   └── user/         # User stats
├── auth/             # Auth pages (signin, error)
├── items/            # Items list and detail pages
├── scan/             # Scan page
└── layout.tsx        # Root layout

components/
├── ui/               # shadcn/ui components
├── auth/             # Auth components
├── items/            # Item-related components
└── scan/             # Scan flow components

lib/
├── ai/               # AI scanning logic
├── auth.ts           # Auth helpers
├── prisma.ts         # Database client
├── rate-limit.ts     # Rate limiting
└── upload.ts         # Image upload

hooks/                # React Query hooks
tests/                # Jest + Playwright tests
```

## License

MIT
