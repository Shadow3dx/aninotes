# CLAUDE.md — Modern Animated Blog (VS Code)

You are an expert full-stack engineer + product designer. Build a production-ready, **modern** blog website with a **card-based home feed**, **polished micro-animations across the UI**, and an **admin publishing dashboard**. The result must feel like a premium modern web app.

## 0) Non-Negotiables
- Must run locally with one command after setup steps.
- TypeScript everywhere.
- Clean, modern UI with consistent spacing/typography.
- Card layout on home (recent posts) + hover states + subtle motion.
- Animations must be tasteful (no nausea): micro-interactions, page transitions, staggered reveals.
- Performance: animations must not tank Lighthouse (prefer transform/opacity).
- Accessibility: reduced motion support and keyboard navigation.
- SEO: metadata, sitemap, RSS, canonical URLs.

## 1) Tech Stack (Use Exactly This)
- Framework: Next.js (App Router) + TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui (use as a base, customize)
- Animations: Framer Motion
- Icons: lucide-react
- Content: Markdown (MDX optional, but Markdown must work)
- ORM: Prisma
- DB: SQLite (dev) + Postgres-ready
- Auth: NextAuth (Auth.js) Credentials (email/password)
- Validation: Zod
- Tests: Playwright smoke test

## 2) Visual Design Requirements (Modern, Premium)
### Brand & Layout
- Use a clean, minimal modern aesthetic (think: Notion x Vercel x Medium).
- Layout width: readable content max width (e.g., 720–800px for post content).
- Home page uses a **responsive grid**:
  - Desktop: 3 columns
  - Tablet: 2 columns
  - Mobile: 1 column
- Typography:
  - Strong headings, comfortable line-height
  - Use a modern font stack (e.g., Geist/SF/Inter fallback; implement with next/font)
- Color system:
  - Neutral base + one accent color
  - Full dark mode support with smooth transitions

### Card System (Home Feed)
Each post card must include:
- Cover image (optional) with subtle zoom on hover
- Title (clamp to 2 lines)
- Excerpt (clamp to 3 lines)
- Tag pills (max 3 visible + “+N”)
- Author + date + reading time
- Hover: elevation + border highlight + gentle motion
- Click opens post detail page

## 3) Motion & Animation Requirements (Framer Motion)
Implement animations in a coherent system:
- Page transitions: fade + slight slide (fast, subtle)
- Staggered card entrance on home page
- Card hover: scale 1.01–1.03 max, shadow/elevation, image parallax/zoom
- Buttons: press feedback + hover glow (subtle)
- Nav: underline/indicator motion
- Toasts/snackbars for admin actions
- Skeleton loaders (animated shimmer) for loading states
- Scroll-based reveal for post content (optional, but keep subtle)

### Reduced Motion (Required)
Respect `prefers-reduced-motion`:
- If enabled, disable non-essential animations and use instant state changes.

## 4) Core Pages (Public)
### Home `/`
- “Latest” feed (paginated)
- Search bar at top (instant UI, server-backed results)
- Tag chips row / category selector
- Featured section (optional) at top with a larger highlighted card

### Post `/posts/[slug]`
- Beautiful typography
- Table of contents (sticky on desktop)
- Reading time + author
- Next/Previous navigation
- Related posts section (by tags/categories)
- Share buttons (copy link at minimum)
- Markdown rendering must be sanitized (no XSS)

### Search `/search`
- Search input with debounced queries
- Results rendered as cards (same design language)

### Tags/Categories/Authors
- `/tags/[tag]`, `/categories/[category]`, `/authors/[username]`
- Header section with animated title + count
- Grid of cards

### SEO Routes
- `/rss.xml`, `/sitemap.xml`, `/robots.txt`
- Dynamic metadata + OpenGraph images (basic OG is fine)

## 5) Admin Requirements (Modern Dashboard)
### Auth & Roles
- Roles: ADMIN, EDITOR, READER
- Only ADMIN/EDITOR access /admin
- Password hashing with bcrypt

### Admin UI
- Admin dashboard with:
  - Stats cards (published, drafts, scheduled)
  - Posts table + filters
- Post editor:
  - Title, slug, excerpt, cover image
  - Tags & categories multi-select (modern pill UI)
  - Markdown editor with live preview
  - Status: Draft / Published / Scheduled (publishAt)
  - Autosave or warn on unsaved changes
- UX polish:
  - Toast on save/publish
  - Confirm modal on delete/unpublish
  - Loading states with skeletons

## 6) Data Model (Prisma — Required)
- User: id, name, email(unique), username(unique), passwordHash, role, image, bio, createdAt, updatedAt
- Post: id, title, slug(unique), excerpt, contentMarkdown, coverImage, status(DRAFT/PUBLISHED), publishAt, publishedAt, authorId, createdAt, updatedAt
- Tag: id, name(unique), slug(unique)
- Category: id, name(unique), slug(unique)
- Join tables: PostTags, PostCategories

## 7) Component System (Required)
Create a reusable design system:
- `PostCard`
- `TagPill`
- `CategoryBadge`
- `MotionWrapper` (standardized entrance animation)
- `Container` (layout)
- `ThemeToggle`
- `Pagination`
- `SearchBar`
- `SkeletonCard`
- `Toaster`

All components must match the same style language.

## 8) Performance Rules for Animation
- Prefer `transform` and `opacity` only
- Avoid expensive box-shadow animation; change shadow intensity minimally
- Use `layout` animations sparingly
- Keep animation durations short (150–300ms typical)

## 9) Implementation Plan (Do This First)
Before writing code:
1) Outline an implementation plan (bulleted, short)
2) Define UI style tokens (spacing, typography, radius, shadows)
3) Then build in increments:
   - Scaffold + Tailwind + shadcn + fonts
   - Prisma schema + seed
   - Auth + roles + middleware
   - Public pages + PostCard grid + motion system
   - Post page typography + TOC + related
   - Admin CRUD + editor + toasts
   - SEO routes + RSS + sitemap + robots
   - Playwright smoke test + polish + README

## 10) Setup Commands (Must Work)
Provide:
- `npm install`
- `npx prisma migrate dev`
- `npx prisma db seed`
- `npm run dev`

Also:
- `npm run lint`
- `npm run test`
- `npm run build`

## 11) Seed Data (Required)
- Create 1 admin user (credentials in README)
- At least 8 tags, 3 categories
- 6+ posts (mix draft/published/scheduled)
- Add cover images (can be placeholders)

## 12) README (Required)
Include:
- Screenshots or GIF instructions (optional)
- Local setup
- Admin login
- How to publish
- Vercel deploy
- Postgres switch instructions
- Notes on animation/reduced motion

## 13) Definition of Done
Done when:
- Modern, premium UI across all pages
- Home page card grid looks and feels modern
- Smooth, tasteful animations everywhere (with reduced motion support)
- Admin can create/edit/publish
- RSS + sitemap work
- `npm run build` passes

END.
