# Northstar PM

Modern project management web app built with Next.js 15, React 18, Tailwind CSS, Supabase, and Vercel-oriented deployment patterns. The app ships with authentication, dashboard analytics, projects, tasks, team directory, settings, comments, activity tracking, realtime refresh, and file attachments.

## Features

- Email/password sign in, sign up, forgot password, protected routes
- Executive dashboard with KPI cards, risk indicators, recent activity, and task status mix
- Projects module with create, edit, archive, detail tabs, progress, team members, notes, and files
- Tasks module with table, kanban, and calendar views plus comments and attachments
- Team directory with roles, project counts, task counts, and workload summary
- Workspace and profile settings
- Supabase Postgres schema with RLS, triggers, activity logging, and seed data
- Supabase Storage bucket for attachments
- Realtime page refresh using Supabase realtime subscriptions

## Stack

- Next.js 15 App Router
- React 18
- TypeScript 5.9
- Tailwind CSS 3.4
- Supabase Auth, Postgres, Realtime, and Storage
- Vercel deployment target

## Local Setup

1. Install dependencies from a Windows terminal if you are following the constraints in [technology.md](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/technology.md):

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.local.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_NAME` (optional)

4. Create or link a Supabase project and run the SQL:

```bash
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

If you prefer the SQL editor, run [supabase/migrations/0001_init.sql](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/supabase/migrations/0001_init.sql) first, then [supabase/seed.sql](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/supabase/seed.sql).

5. Ensure the `attachments` storage bucket exists and realtime is enabled for the relevant public tables.

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Users

Seeded accounts:

- `admin@northstarpm.com` / `Password123!`
- `manager@northstarpm.com` / `Password123!`
- `member@northstarpm.com` / `Password123!`

## Project Structure

- [app](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/app): App Router pages, layouts, API routes
- [components](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/components): reusable UI, layouts, and feature components
- [lib/actions](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/lib/actions): server actions for auth and workspace CRUD
- [lib/data](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/lib/data): app constants and Supabase query functions
- [lib/supabase](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/lib/supabase): browser, server, middleware, and admin clients
- [supabase/migrations](/mnt/c/Users/edcas/My%20Drive/AI/Project-Mgmt/supabase/migrations): schema and RLS

## Notes

- Project progress is recalculated in Postgres triggers based on completed tasks.
- Archived projects are soft-hidden with an `archived` flag.
- Attachment metadata is stored in Postgres and binaries are stored in Supabase Storage.
- Realtime is used for refresh-on-change behavior rather than building a separate websocket server.

## Deployment

Deploy to Vercel with the same environment variables used locally. Apply database migrations separately from the frontend deploy.

## Verification

The codebase was created in an empty workspace. Dependencies were not installed and build/lint commands were not run in this session, so you should run `npm install`, `npm run lint`, and `npm run build` after connecting your Supabase project.
