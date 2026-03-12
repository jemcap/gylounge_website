# Local Supabase Development Guide

## Purpose
This guide explains how to develop and test GYLounge against a local Supabase stack running through Docker-compatible containers, instead of using the deployed Supabase database.

The goal is to let you:
- iterate on schema and app logic without touching production data
- reset your database to a known state whenever you need
- keep database changes in migrations and version control
- promote tested changes from local to staging and then to production

This guide is written specifically for this repository.

## Why This Repository Should Use Local Supabase
GYLounge is already structured in a way that makes local Supabase practical:
- `lib/supabase.ts` builds both the public and admin clients entirely from environment variables
- server actions in `app/home/actions.ts` use the service-role client for privileged writes
- `app/types/database.ts` is the central TypeScript type source for the database contract
- `package.json` already includes the `supabase` CLI as a dev dependency

That means you do not need a fake API server. You can run the real Supabase stack locally and point the app at local keys and URLs.

## Recommended Environment Strategy
Use three separate environments:

1. Local Supabase via Docker-compatible containers
2. A non-production hosted Supabase project for staging/integration checks
3. Your deployed production Supabase project

Do not use production for normal development, manual testing, or schema experimentation.

## What Local Supabase Gives You
Supabase’s local workflow is designed around the CLI and schema migrations. With the local stack running, you get:
- local Postgres
- local Supabase API endpoints
- local Studio
- local anon and service-role keys
- migration and reset workflows
- optional local database tests with `npx supabase test db --local`

Important limitation:
- Supabase documents that the local environment is not as feature-complete as the hosted platform, so you should still keep staging for final checks.

## Prerequisites

### 1. Container runtime
Install a container runtime compatible with Docker APIs. Supabase documents support for options such as:
- Docker Desktop
- Rancher Desktop
- Podman
- OrbStack

If your machine is on an untrusted public network, Supabase recommends binding the local stack to `127.0.0.1`.

### 2. Node.js and npm
This repo already uses npm. No package-manager change is needed.

### 3. Supabase CLI
This repository already includes the CLI as a dev dependency, so prefer `npx supabase ...` commands from the repo root.

### 4. Local resources
Supabase’s CLI docs note that running the full local stack needs meaningful local resources. Plan for a machine with enough RAM and disk for Docker images and containers.

## Safety Rules Before You Start
Before doing any setup:

1. Make sure your local `.env.local` is not pointing at production Supabase.
2. Do not copy your production service-role key into local-only workflows unless you intentionally need to connect to the hosted environment.
3. Treat the local database as disposable.
4. Treat staging as the last checkpoint before production.

## Repository-Specific Environment Variables
This app needs more than just Supabase vars if you want the main registration and booking flows to work locally.

### Required Supabase variables
These are read by `lib/supabase.ts`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:
- `lib/supabase.ts` accepts either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` is required for server actions that use `supabaseAdminClient()`

### Required bank-transfer variables
These are read by `lib/membership.ts`. If they are missing, local membership registration fails before completion.

```env
MEMBERSHIP_FEE_GHS=
BANK_TRANSFER_ACCOUNT_NAME=
BANK_TRANSFER_ACCOUNT_NUMBER=
BANK_TRANSFER_BANK_NAME=
BANK_TRANSFER_INSTRUCTIONS=
```

### Email-related variables
These are read by `lib/resend.ts`:

```env
RESEND_API_KEY=
RESEND_FROM=
BOOKING_NOTIFICATION_EMAILS=
```

Important repo-specific note:
- Supabase local development includes Mailpit, but this app currently sends email through the Resend API, not SMTP
- that means local Supabase does not automatically capture app emails
- if you want the registration and booking email paths to succeed locally, you still need valid email settings or you must accept local email warnings/failures during testing

## Step 1. Initialize Supabase in This Repository
Run this once from the repo root:

```bash
npx supabase init
```

Expected result:
- a new `supabase/` directory is created
- this directory is safe to commit

This directory will eventually hold:
- `config.toml`
- migrations
- seed data
- optional database tests

## Step 2. If You Already Have a Hosted Supabase Schema, Pull It Into Migrations
This repo already expects a hosted Supabase project. If the remote schema exists already, capture it before doing local-first work.

### 2.1 Log in to the CLI
```bash
npx supabase login
```

### 2.2 Link this repository to your hosted project
```bash
npx supabase link --project-ref <project-ref>
```

You can find `<project-ref>` in the hosted Supabase dashboard URL.

### 2.3 Pull the current remote schema into local migrations
```bash
npx supabase db pull
```

Why this matters:
- if schema changes were made directly in the hosted dashboard, this step captures them as migration files
- after this point, you should stop using the hosted dashboard for schema edits and work from migrations instead

## Step 3. Start the Local Supabase Stack
Start the local services:

```bash
npx supabase start
```

On the first run, the CLI downloads the required images. This can take a while.

When startup finishes, Supabase prints local connection details such as:
- API URL
- DB URL
- Studio URL
- Mailpit URL
- anon key
- service-role key

You can also re-print the local connection variables with:

```bash
npx supabase status -o env
```

This is the easiest way to populate your local env file safely.

## Step 4. Point This App at the Local Stack
Update `.env.local` so the app uses the local Supabase credentials rather than your hosted project.

Example structure:

```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key from `npx supabase status -o env`>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key from `npx supabase status -o env`>

# Local bank-transfer placeholders required by lib/membership.ts
MEMBERSHIP_FEE_GHS=120
BANK_TRANSFER_ACCOUNT_NAME="GYLounge Local"
BANK_TRANSFER_ACCOUNT_NUMBER="0000000000"
BANK_TRANSFER_BANK_NAME="Local Test Bank"
BANK_TRANSFER_INSTRUCTIONS="Local development only. Do not transfer funds."

# Email options
RESEND_API_KEY=<optional, real or test key if you want live email behavior>
RESEND_FROM="GYLounge <onboarding@resend.dev>"
BOOKING_NOTIFICATION_EMAILS="owner@example.com"
```

Recommendations:
- set `NEXT_PUBLIC_SUPABASE_ANON_KEY`; you do not need both anon and publishable keys for this repo
- use obvious placeholder bank-transfer values locally
- do not reuse real banking text meant for production

## Step 5. Apply Migrations to the Local Database
If you pulled or created migrations, apply them locally:

```bash
npx supabase db reset
```

Why use `db reset`:
- it rebuilds the local database from the current migration set
- it also runs `supabase/seed.sql` if you add one
- it gives you a reproducible local state

Use this command whenever you want a clean rebuild.

## Step 6. Add Seed Data for Repeatable Development
Create `supabase/seed.sql` and insert the minimum development data your app needs.

For this repo, that will likely become:
- sample members
- sample locations
- sample dated hourly slots
- optional admin-usable rows if you later add local admin auth data

After changing the seed file, re-run:

```bash
npx supabase db reset
```

Use seed data for stable manual testing instead of manually editing the hosted project.

## Step 7. Run the Next.js App Against Local Supabase
With the local stack running and `.env.local` updated:

```bash
npm run dev
```

From this point:
- all Supabase reads and writes should target local services
- the service-role client should use the local service-role key
- your development iterations should not hit the deployed database

## Step 8. Keep the Database Type Definitions in Sync
This repo uses `app/types/database.ts` as the database type source.

After changing the local schema, regenerate types from the local database:

```bash
npx supabase gen types typescript --local > app/types/database.ts
```

Recommended workflow:
1. change schema locally
2. capture migration
3. run `npx supabase db reset`
4. regenerate `app/types/database.ts`
5. run app tests/build checks

## Step 9. Make Schema Changes the Right Way
Use a migration-driven workflow.

### Option A: SQL-first
Write migration SQL directly into a new migration file under `supabase/migrations`.

Then rebuild locally:

```bash
npx supabase db reset
```

### Option B: Studio-first, then diff
If you make schema changes in local Studio, capture them into a migration file before you keep working:

```bash
npx supabase db diff -f describe_your_change
```

Then apply/reset locally again so the migration history becomes the source of truth.

Rule:
- do not make schema changes directly in production and leave them undocumented

## Step 10. Optional: Add Database Tests
Supabase supports local pgTAP database tests.

You can add tests under `supabase/tests` and run:

```bash
npx supabase test db --local
```

This is useful when you start adding:
- RLS policies
- triggers
- SQL functions
- constraints that need direct database validation

## Step 11. Optional: Local Auth Provider Configuration
If you later want to test Supabase Auth providers locally, configure them in `supabase/config.toml` and use local `.env` substitution for provider secrets.

After changing auth config:

```bash
npx supabase stop
npx supabase start
```

This is more relevant once the planned admin-auth work is active in this repo.

## Daily Development Workflow
Use this as your normal loop:

1. Start local Supabase
   ```bash
   npx supabase start
   ```
2. Confirm local env vars
   ```bash
   npx supabase status -o env
   ```
3. Run the app
   ```bash
   npm run dev
   ```
4. Make schema changes locally
5. Rebuild local DB if needed
   ```bash
   npx supabase db reset
   ```
6. Regenerate DB types
   ```bash
   npx supabase gen types typescript --local > app/types/database.ts
   ```
7. Run repo validation
   ```bash
   npm run lint
   npm run test
   ./node_modules/.bin/next build
   ```

## Promoting Changes Without Using Production for Development
Once local changes are stable:

### 1. Push local code and migrations to git
Commit:
- migration files
- seed changes if applicable
- generated types
- app code

### 2. Use staging first
Link to a staging Supabase project and deploy migrations there before touching production.

### 3. Push migrations to the remote environment
```bash
npx supabase db push
```

Use this only after you are confident in the local migration set.

### 4. Promote to production separately
Repeat the same reviewed migration process for production after staging passes.

## Commands You Will Use Most

### Initialize once
```bash
npx supabase init
```

### Start local services
```bash
npx supabase start
```

### See local URLs and keys
```bash
npx supabase status -o env
```

### Stop local services
```bash
npx supabase stop
```

### Stop and remove local data
```bash
npx supabase stop --no-backup
```

### Reset local DB from migrations and seed
```bash
npx supabase db reset
```

### Pull remote schema into migrations
```bash
npx supabase db pull
```

### Push local migrations to a linked remote database
```bash
npx supabase db push
```

### Generate local TypeScript database types
```bash
npx supabase gen types typescript --local > app/types/database.ts
```

### Run local database tests
```bash
npx supabase test db --local
```

## Repo-Specific Caveats

### 1. Membership registration needs bank-transfer env vars
`lib/membership.ts` throws if the bank-transfer variables are missing. Local registration will fail until those are set.

### 2. Email still uses Resend
The app does not currently send mail through Supabase Mailpit. Missing `RESEND_API_KEY` or notification email configuration affects the local registration and booking experience.

### 3. Service-role behavior is part of app logic
Because `app/home/actions.ts` uses `supabaseAdminClient()`, local development should use the real local service-role key rather than a hand-written mock.

### 4. Unit tests are still useful
This repo’s existing unit tests mock Supabase at the library boundary. Keep those for fast feedback. Local Supabase is for integration confidence and manual development.

## Troubleshooting

### `Supabase URL and Key must be provided`
Cause:
- local env vars are missing or `.env.local` still points at the wrong environment

Fix:
- run `npx supabase status -o env`
- copy the local values into `.env.local`
- restart the Next.js dev server

### `Supabase URL and Service Role Key must be provided`
Cause:
- `SUPABASE_SERVICE_ROLE_KEY` is missing locally

Fix:
- copy the local service-role key from `npx supabase status -o env`

### Membership form returns error locally
Cause:
- bank-transfer env vars are missing

Fix:
- add the `MEMBERSHIP_FEE_GHS` and `BANK_TRANSFER_*` variables described above

### Local emails are not appearing in Mailpit
Cause:
- this app sends through Resend, not SMTP

Fix:
- use a Resend key for realistic email testing
- or accept that local flows may complete with email warnings

### Docker containers fail to start
Cause:
- Docker-compatible runtime is not running
- ports are already in use
- local machine resources are constrained

Fix:
- confirm your container runtime is running
- free occupied ports
- restart the runtime and rerun `npx supabase start`

## Recommended Next Improvements After Setup
Once local Supabase is in place, the next useful improvements for this repo are:

1. add a committed `supabase/seed.sql` with members, locations, and dated hourly slots
2. document a staging project ref and promotion flow
3. add local database tests for critical SQL and policy behavior
4. decide whether local email testing should continue through Resend or be abstracted for non-production environments

## Source References
Official Supabase sources used for this guide:
- Supabase Local Development: https://supabase.com/docs/guides/local-development
- Supabase CLI getting started: https://supabase.com/docs/guides/local-development/cli/getting-started
- Supabase local development with schema migrations: https://supabase.com/docs/guides/local-development/overview
- Supabase managing environments: https://supabase.com/docs/guides/deployment/managing-environments
- Supabase CLI reference: https://supabase.com/docs/reference/cli
