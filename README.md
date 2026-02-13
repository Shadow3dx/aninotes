# AniNotes - Anime Episode Reviews

A modern, premium blog for writing personal anime episode reviews. Built with Next.js, Tailwind CSS, Framer Motion, and Prisma.

## Features

- **Card-based home feed** with responsive grid (3/2/1 columns), hover animations, and tag filtering
- **Anime-specific fields** on every post: anime title, episode number, season, and 1-10 rating
- **Rich post pages** with markdown rendering, table of contents, related posts, and share buttons
- **Admin dashboard** with stats, post management table, and a full markdown editor with live preview
- **Dark/light mode** with crimson accent color
- **Framer Motion animations** throughout with `prefers-reduced-motion` support
- **SEO** with sitemap, RSS feed, robots.txt, and OpenGraph metadata
- **Search** by anime title, post title, or keywords

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up the database
npx prisma migrate dev

# 3. Seed sample data
npx prisma db seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the blog.

## Admin Login

- **Email:** `admin@aninotes.com`
- **Password:** `AniNotes2024!`
- **URL:** [http://localhost:3000/login](http://localhost:3000/login)

After logging in, you'll be redirected to the admin dashboard at `/admin`.

## How to Publish a Review

1. Log in at `/login`
2. Click **"New Review"** in the admin dashboard
3. Fill in the anime details (title, season, episode, rating)
4. Write your review in Markdown (use the Preview tab to check)
5. Select tags and categories
6. Set status to **Published** and click **Save**

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **ORM:** Prisma 6
- **Database:** SQLite (dev)
- **Auth:** NextAuth v5 (Auth.js) with Credentials provider
- **Validation:** Zod
- **Toast Notifications:** Sonner

## Switching to PostgreSQL

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`
2. Update `DATABASE_URL` in `.env` to your Postgres connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/aninotes"
   ```
3. Run `npx prisma migrate dev --name switch-to-postgres`
4. Run `npx prisma db seed`

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `DATABASE_URL` (use a hosted Postgres like Neon or Supabase)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
4. Deploy

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Animation & Reduced Motion

All animations use Framer Motion with `transform` and `opacity` only for performance. Durations are 150-300ms.

If you have **Reduce Motion** enabled in your OS accessibility settings, all non-essential animations are disabled automatically. The site remains fully functional with instant state changes.

## Project Structure

```
src/
  app/
    (public)/      # Public pages (home, posts, search, tags, categories)
    (auth)/        # Login page
    (admin)/       # Admin dashboard and CRUD
    api/           # Auth + search API routes
  components/
    ui/            # shadcn/ui components
    layout/        # Navbar, footer, container, admin sidebar
    posts/         # PostCard, PostGrid, PostContent, etc.
    tags/          # TagPill, TagRow, CategoryBadge
    motion/        # MotionWrapper, StaggerContainer
    search/        # SearchBar
    admin/         # PostEditor, TagManager, etc.
    shared/        # ThemeToggle, Pagination, SkeletonCard
  lib/             # Prisma client, auth config, utilities
  actions/         # Server Actions for CRUD
  hooks/           # Custom React hooks
  types/           # TypeScript type definitions
prisma/
  schema.prisma    # Database schema
  seed.ts          # Seed data script
```
