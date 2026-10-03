# Task App — Next.js App Router (Server Components + Server Actions)

A minimal but complete full-stack loop:
**Postgres/SQLite → Prisma → Server Component (read) → Client Component (interact) → Server Action (write) → back to the top.**

## Run it locally

```bash
cd task-app
npm install
npx prisma db push     # creates dev.db (SQLite) from prisma/schema.prisma
npm run dev
```

Open http://localhost:3000 — add a task, check it off, delete it. Every action
hits the real database (`prisma/dev.db`) through a Server Action, no `/api`
routes involved.

Inspect the data anytime with:
```bash
npm run db:studio
```

## File map — what to read, in what order

```
prisma/schema.prisma   the data shape (Task model)
lib/prisma.ts          shared Prisma client
lib/actions.ts         Server Actions: createTask, toggleTask, deleteTask
app/page.tsx           Server Component — reads tasks, renders the page
app/layout.tsx         shared shell around every page
app/loading.tsx        automatic loading UI
app/error.tsx          automatic error UI
components/TaskForm.tsx  Client Component — the add-task form
components/TaskItem.tsx  Client Component — one task row (checkbox + delete)
app/globals.css        all styling
```

Read `app/page.tsx` first, then `lib/actions.ts`, then the two components.
That's the whole loop.

## Why each file is Server or Client

| File | Type | Why |
|---|---|---|
| `app/page.tsx` | Server | Awaits `prisma.task.findMany()` directly — no browser JS needed to just display data |
| `lib/actions.ts` | Server (`"use server"`) | Writes to the database — must never run in the browser |
| `components/TaskForm.tsx` | Client (`"use client"`) | Uses `useState` for the input, submits a form |
| `components/TaskItem.tsx` | Client (`"use client"`) | Has `onClick` handlers |
| `app/layout.tsx` | Server | Pure structure, no interactivity |
| `app/error.tsx` | Client (required by Next.js) | Must catch client-render errors + has a retry button |

## Auth is implemented — register, login, logout

This uses Auth.js (NextAuth v5) with a Credentials provider (email +
password), password hashing via `bcryptjs`, and JWT sessions (no separate
Session table needed).

**Files involved:**

| File | Role |
|---|---|
| `auth.ts` | NextAuth config: how a login is verified (`authorize`), what goes in the session |
| `app/api/auth/[...nextauth]/route.ts` | Wires NextAuth's internal endpoints into the App Router |
| `lib/auth-actions.ts` | Server Actions: `registerUser`, `loginUser`, `logoutUser` |
| `components/LoginForm.tsx` / `RegisterForm.tsx` | Client Components — `useFormState` shows inline errors |
| `app/login/page.tsx` / `app/register/page.tsx` | Server Components — redirect away if already signed in |
| `app/page.tsx` | Redirects to `/login` if no session; queries tasks `where userId = session.user.id` |
| `lib/actions.ts` | Every mutation re-checks `auth()` and scopes by `userId` — never trusts the client |
| `prisma/schema.prisma` | `User` model + `Task.userId` relation |

**One-time setup after pulling these changes:**

```bash
npm install          # installs next-auth + bcryptjs
```

Add `AUTH_SECRET` to `.env` (a random string used to sign session cookies):
```bash
npx auth secret
```
Copy the `AUTH_SECRET=...` line it prints into your `.env` (don't use the
`BETTER_AUTH_SECRET` name it might show for a different package — rename the
key to `AUTH_SECRET`).

Then re-sync the schema (this adds the `User` table and `Task.userId`):
```bash
npx prisma db push
```
If you already have Task rows from before auth existed, Prisma will warn
about dropping/resetting them since they have no owner — that's expected;
confirm to reset, then start fresh by registering an account.

**Try it:** `npm run dev` → visit `/register` → create an account → you're
auto-logged-in and redirected to `/` → add a task → click "Log out" → try
visiting `/` directly, you'll be bounced to `/login`.

### Why each auth piece is Server or Client
- `authorize()` in `auth.ts` and everything in `auth-actions.ts` run only on
  the server — passwords are hashed/compared there, never in the browser.
- `LoginForm.tsx` / `RegisterForm.tsx` are Client Components only because
  `useFormState` needs to hold the "show this error" state reactively.
- The login/register **pages** themselves stay Server Components — they only
  need to check `auth()` and redirect, no interactivity of their own.

Clerk is an alternative to Auth.js — it gives you `auth()` from
`@clerk/nextjs/server` and hosted login pages out of the box (less config,
less control, a paid tier at scale).

## Deploying

1. Push this folder to a GitHub repo.
2. Go to vercel.com → "New Project" → import the repo. Vercel auto-detects
   Next.js.
3. Create a free Postgres database on neon.tech or supabase.com, copy its
   connection string.
4. In `prisma/schema.prisma`, change `provider = "sqlite"` to
   `provider = "postgresql"`.
5. In the Vercel dashboard → Project → Settings → Environment Variables, add
   `DATABASE_URL` = your Neon/Supabase connection string.
6. Redeploy. Vercel runs `prisma generate` automatically via `postinstall`.
   Run `npx prisma db push` once (locally, pointed at the prod `DATABASE_URL`,
   or via Vercel's build command) to create the tables in the new database.
7. Visit the live `.vercel.app` URL.

## What to extend next (good "AI track" practice tasks)

Ask your coding agent to plan each of these before writing code, review the
diff, then accept:
- Add an "edit task" flow (inline rename) — decide: does the edit box need
  its own Client Component, or can it live inside `TaskItem`?
- Extend `TaskForm` to show a validation error inline (title required) using
  the same `useFormState` pattern the login/register forms already use.
- Add a `dueDate` field and sort overdue tasks to the top.
- Add a "forgot password" flow, or a Google/GitHub OAuth provider alongside
  Credentials in `auth.ts`.
