# System Architecture

## Purpose
This document is the high-level system to follow while building GYLounge. It is derived from `docs/PROJECT_OVERVIEW.md` and translates that vision into a practical architecture and delivery model.

## Product Intent
GYLounge is an elderly-friendly event and membership platform for Ghana with:
- Public no-auth flows (email-based identity)
- Membership-required booking
- Manual bank-transfer activation
- Protected in-app admin console (Supabase Auth)

## Architecture Principles
- Simplicity first: prefer fewer moving parts over automation.
- Server-enforced rules: membership checks and privileged writes must be server-side.
- Email as member identity: no passwords for public users.
- Operational clarity: bank transfer references must be unique and traceable.
- Composable modules: routes delegate domain logic to `lib/*` helpers.

## System Boundaries
- Frontend and server runtime: Next.js App Router on Vercel.
- Data and admin identity provider: Supabase (Postgres + Auth).
- Transactional email provider: Resend.
- Payments: manual Ghana bank transfer only.

## Route Architecture (Target)
The target route map mirrors `docs/PROJECT_OVERVIEW.md`:
- `/` landing and navigation entrypoint
- `/events` event listing and location filtering
- `/events/[eventId]` event detail and slot selection
- `/booking/confirm` booking completion state
- `/membership` membership sign-up and bank instructions
- `/membership/pending` waiting state until activation
- `/my-bookings` email-based booking lookup
- `/admin/login` admin authentication
- `/admin` dashboard
- `/admin/members` membership activation and member ops
- `/admin/bookings` bookings operations
- `/admin/events` events operations
- `/admin/slots` slot operations

## Layered Design

### 1. Presentation Layer (`app/`, `components/`)
Responsibilities:
- Collect user input and render state.
- Keep UI logic thin.
- Call Server Actions or Route Handlers for mutations.

Guideline:
- Client components only for interactivity.
- Server components by default.

### 2. Domain/Application Layer (Server Actions + API)
Responsibilities:
- Enforce booking and membership rules.
- Orchestrate Supabase reads/writes.
- Trigger email side effects through `lib/resend.ts`.

Primary server use cases:
- `createMembershipIntent`
- `createBooking`
- `lookupBookingsByEmail`
- `activateMember` (admin only)
- `manageEventsSlots` (admin only)

### 3. Integration Layer (`lib/*`)
Responsibilities:
- Encapsulate service provider usage.
- Centralize env var contracts.

Current modules:
- `lib/supabase.ts`: public and service-role clients
- `lib/membership.ts`: email normalization, bank details, reference generation
- `lib/resend.ts`: booking/membership/admin email helpers

### 4. Data Layer (Supabase Postgres)
Core tables:
- `members`
- `locations`
- `events`
- `slots`
- `bookings`

Type source of truth:
- `app/types/database.ts`

## Core Business Rules
- Only `members.status = 'active'` can complete bookings.
- Every membership intent gets a unique `bank_transfer_reference`.
- Slot capacity cannot go below zero.
- Admin-only operations must require authenticated admin identity.
- Public lookups (`/my-bookings`) should expose minimal fields.

## Security Model

### Public Area
- No login.
- Email is the user key for membership and booking retrieval.

### Admin Area
- Supabase Auth session is required.
- Authorization gate by `ADMIN_EMAIL_ALLOWLIST` (MVP).
- Service role writes only on the server.

### Data Safeguards
- Validate all server action inputs.
- Avoid returning unnecessary PII.
- Add RLS and policy checks when admin/data endpoints expand.

## End-to-End Flows

### Event Browsing
1. User opens `/events`.
2. Server reads events and locations from Supabase.
3. UI renders filterable event list.

### Membership Activation Flow
1. User submits membership form.
2. Server creates `members` record with `status = 'pending'` and unique reference.
3. App shows bank instructions and sends email.
4. Admin validates transfer and sets member status to `active`.
5. Optional welcome email sent after activation.

### Booking Flow
1. User opens event detail and selects slot.
2. Server checks member by normalized email.
3. If active, reserve slot and insert booking.
4. Send confirmation (member) and notification (organizer).
5. If not active, redirect user to membership flow.

### My Bookings Flow
1. User submits email on `/my-bookings`.
2. Server resolves member and bookings.
3. UI returns constrained booking list.

## Concurrency and Integrity
- Protect slot booking with database-level transaction or RPC (`SELECT ... FOR UPDATE`).
- Insert booking only after capacity decrement succeeds.
- Keep booking creation idempotency strategy in scope for retries.

## Deployment and Configuration
Required environment groups:
- Supabase: URL, anon/publishable key, service role key
- Resend: API key, sender, organizer recipients
- Membership bank details: fee and bank instructions
- Admin: email allowlist

## Build Sequence (Execution Order)
1. Foundation: env contracts, Supabase wiring, typed schema, base route skeleton.
2. Event catalog: `/events`, `/events/[eventId]`, location filtering.
3. Membership flow: `/membership`, `/membership/pending`, pending-member creation + email.
4. Booking flow: membership check, slot reservation, booking writes, confirmation emails.
5. My bookings: email lookup with privacy-safe output.
6. Admin console: auth, route protection, member activation, event/slot/booking management.
7. Hardening: tests, validations, observability, deployment readiness.

## Status Snapshot (Current Repository)
Implemented now:
- `app/page.tsx`
- `app/events/page.tsx`
- Route skeletons for:
  - `/events/[eventId]`
  - `/booking/confirm`
  - `/membership`
  - `/membership/pending`
  - `/my-bookings`
  - `/admin/login`
  - `/admin`
  - `/admin/members`
  - `/admin/bookings`
  - `/admin/events`
  - `/admin/slots`
- Component boilerplates for:
  - `components/ui/*`
  - `components/forms/*`
  - `components/events/*`
- `lib/supabase.ts`
- `lib/membership.ts`
- `lib/resend.ts`
- integration tests under `__tests__/lib/*`

Planned next:
- Replace scaffold placeholders with:
  - Supabase-backed event, slot, membership, and booking flows
  - Server-enforced membership checks and transactional booking logic
  - Supabase-authenticated admin operations and route protection

## Documentation Contract
- `docs/PROJECT_OVERVIEW.md` remains the product-definition source.
- This file is the architecture execution guide.
- `docs/IMPLEMENTATION_ROADMAP.md` is the milestone plan tied to this architecture.
