# Admin Portal Implementation Plan

## Purpose
This document defines the implementation plan for a protected admin portal that allows authorised admins to manage members and bookings inside the existing GYLounge Next.js and Supabase stack.

The plan assumes:
- Admin auth uses Supabase Auth.
- Only allowlisted admin emails may access the portal.
- Public users still do not create accounts or log in.
- Member status remains `pending` and `active`.

## Goals
- Add an admin-only login and password reset flow.
- Replace the current admin placeholders with working member and booking management pages.
- Keep privileged writes server-side.
- Reuse the existing `members`, `locations`, `slots`, and `bookings` tables wherever possible.
- Keep the implementation simple, maintainable, and aligned with the current app architecture.

## Final Scope

### Included
- `/admin/login`
- `/admin/reset-password`
- `/admin`
- `/admin/members`
- `/admin/bookings`
- `/admin/bookings/[date]`
- Admin session handling and route protection
- Member search, edit, status change, and delete
- Booking calendar view, date detail view, and booking amendment flow
- Supporting schema/types/docs/test updates

### Not included in this slice
- New public-user account features
- Location CRUD on `/admin/events`
- Slot CRUD on `/admin/slots`
- A full audit log system

## Product Decisions Locked For This Plan
- Admin login uses email and password.
- Password reset is supported.
- Admin authentication is only for `/admin/*` routes used to view dashboards and manage members/bookings.
- Authorisation is enforced by `ADMIN_EMAIL_ALLOWLIST`.
- Member status vocabulary remains `pending` and `active`.
- Booking amendment means full booking edit, including moving a booking to a different slot if needed.
- Calendar UI should use native date handling rather than adding a calendar package.
- Membership and booking references should be persisted in a dedicated reference table instead of storing references on `members` or `bookings` directly.

## Current Repository State
- `/admin/login`, `/admin`, `/admin/members`, `/admin/bookings`, `/admin/bookings/[date]`, `/admin/events`, and `/admin/slots` all exist; `/admin`, `/admin/members`, `/admin/bookings`, and `/admin/bookings/[date]` now have live implementations, while the later location/availability routes still carry placeholder content.
- The protected admin routes now reuse `LoginHeader`, add a left-side hamburger drawer (`z-index: 100`), and render a shared page-heading area with the signed-in admin email.
- `/admin` now shows read-only summary metrics for total members, pending members, and total bookings.
- `/admin/members` now loads members server-side, filters the list in the client, and writes through protected `PUT`/`DELETE /api/admin/members/[id]` handlers with validation and booking-aware delete guards.
- `/admin/bookings/[date]` now lets admins click a booking card to open a booking-detail drawer, then move into a booking edit form backed by protected `PATCH /api/admin/bookings/[id]`.
- Public membership sign-up is already wired through `/register`.
- Public booking creation is already wired through `/home`.
- Supabase admin writes already exist via `supabaseAdminClient()`.
- The database currently contains `members`, `locations`, `slots`, and `bookings`.
- The `bookings` table now persists `guest_count`, which keeps the public booking flow aligned with future admin-side capacity restoration needs.

## Implementation Overview

### Phase 1: Admin Auth and Route Protection

#### Routes
- Keep `/admin/login` public.
- Add `/admin/reset-password` for password recovery completion.
- Protect the working admin routes:
  - `/admin`
  - `/admin/members`
  - `/admin/bookings`
  - `/admin/bookings/[date]`

#### Auth behaviour
- Create an admin login form with:
  - email
  - password
  - submit action
  - "Forgot password" action
- Use Supabase Auth to:
  - sign admins in
  - send password reset emails
  - complete password reset
  - sign admins out

#### Authorisation behaviour
- After authentication, verify the user email against `ADMIN_EMAIL_ALLOWLIST`.
- Reject authenticated users who are not allowlisted.
- Enforce the same check on:
  - protected admin pages
  - admin route handlers
  - admin server actions

#### Shared helpers to add
- Browser Supabase auth helper for login/reset UI.
- Server Supabase auth helper for protected pages.
- Shared `requireAdminUser()` helper.
- Shared allowlist parser/helper.

#### UX expectations
- Unauthenticated access to protected admin routes redirects to `/admin/login`.
- Non-allowlisted authenticated users are signed out and shown an access-denied message.
- Login page supports inline feedback for bad credentials and reset-email success/failure.
- Phase 1 stops at auth, recovery, and route protection; the shared admin header and hamburger drawer begin in Phase 2.

### Phase 2: Admin Layout and Dashboard

#### Admin shell
- Replace the placeholder admin pages with a shared admin layout.
- Include:
  - the existing `LoginHeader` as the fixed topbar
  - left-side absolute hamburger trigger with overlay treatment
  - page heading area
  - hamburger drawer items for:
    - Dashboard
    - Memberships
    - Bookings
  - logout action pinned at the bottom of the drawer
  - consistent card/list/form treatment

#### Dashboard requirements
- `/admin` shows two summary cards:
  - Members
  - Bookings

#### Dashboard card content
- Members card:
  - primary metric: total members
  - secondary metric: pending sign-ups
  - CTA to `/admin/members`
- Bookings card:
  - primary metric: total bookings
  - CTA to `/admin/bookings`

#### Data source
- Query `members` and `bookings` server-side in the page.
- Keep the dashboard read-only.

### Phase 3: Member Management

#### Page behaviour
- `/admin/members` loads all member records server-side.
- Provide a search bar that filters all loaded member rows by:
  - first name
  - last name
  - email

#### List layout
- Show one full-width members table.
- Columns:
  - Name
  - Date Added
  - Status
  - Actions
- The name cell can include supporting identity text such as the member email.
- The table should include every member row returned from the `members` query, regardless of status.

#### Edit flow
- Clicking `Edit` opens a right-side member drawer rather than a centered modal.
- Admin can edit all existing member fields:
  - `first_name`
  - `last_name`
  - `email`
  - `birthday`
  - `gender`
  - `phone`
  - `home_address_line1`
  - `home_address_line2`
  - `home_address_digital`
  - `emergency_contact_first_name`
  - `emergency_contact_last_name`
  - `emergency_contact_relationship`
  - `emergency_contact_phone`
  - `status`
- Status control only permits:
  - `pending`
  - `active`

#### Mutation path
- Use an internal admin API route:
  - `PUT /api/admin/members/[id]`
- Validate payload with Zod before writing to Supabase.
- Normalise email before saving.

#### Delete behaviour
- Use:
  - `DELETE /api/admin/members/[id]`
- For the first version, deletion should be conservative:
  - if the member has related bookings, reject deletion with a clear error
  - do not silently cascade or orphan data

### Phase 4: Reference and Booking Integrity Prep

#### Reference persistence to add first
Generated references are currently used in communication flows but should be persisted in a dedicated table for reconciliation.

#### Required schema change (references)
- Add a dedicated table, for example `public.payment_references`, with:
  - `id uuid primary key default gen_random_uuid()`
  - `member_id uuid not null references public.members(id) on delete cascade`
  - `booking_id uuid null references public.bookings(id) on delete set null`
  - `reference text not null unique`
  - `reference_type text not null check (reference_type in ('membership', 'booking'))`
  - `status text not null default 'issued'`
  - `created_at timestamptz not null default now()`

#### Required application updates (references)
- On membership submission, create a `payment_references` row with `reference_type = 'membership'`.
- When a booking reference is introduced, create a `payment_references` row with `reference_type = 'booking'` and link `booking_id`.
- Use the reference table as the source of truth for admin reconciliation and support workflows.

#### Problem to fix first
The public booking flow already reduces slot capacity by submitted guest count, but the `bookings` table does not store guest count. That makes later admin edits or cancellations unsafe because capacity cannot be restored correctly.

#### Required schema change
- Add `guest_count integer not null default 1` to `public.bookings`.
- Backfill existing rows to `1`.

#### Required application updates
- Update public booking creation to persist `guest_count`.
- Update generated Supabase types in `app/types/database.ts`.

### Phase 5: Booking Calendar Page

#### Page behaviour
- `/admin/bookings` is the top-level bookings management page.
- Load:
  - all locations
  - booking counts grouped by date

#### Filters
- Add a location dropdown:
  - default: all locations
  - selecting a location narrows the calendar counts to that location

#### Calendar requirements
- Render a monthly calendar grid using native date utilities.
- Each day cell displays the number of bookings for that date.
- Dates with bookings should be visually emphasized.
- Clicking a date navigates to:
  - `/admin/bookings/[date]`
- Preserve selected `locationId` in the query string so the detail page can stay filtered.

#### Data shape needed
- For the calendar page, aggregate bookings by:
  - date
  - optional location
- This will require joining:
  - `bookings`
  - `slots`
  - `locations`

### Phase 6: Booking Date Detail Page

#### Page behaviour
- `/admin/bookings/[date]` displays bookings for a specific date.
- Support optional location filtering through search params.
- Include:
  - location filter
  - search/filter bar
  - grouped time-slot display
  - clickable booking cards that open a booking-detail drawer before editing

#### Slot grouping
- Group bookings by slot.
- Each slot section shows:
  - time range
  - location name
  - member(s) booked in that slot

#### Search behaviour
- Filter by:
  - member first name
  - member last name
  - member email

#### Booking amendment flow
- Admin can amend:
  - member first name
  - member last name
  - member email
  - member phone number
  - location
  - slot on the same date
  - number of guests
- Booking id is displayed in the detail drawer but remains immutable.

#### Mutation path
- Use:
  - `PATCH /api/admin/bookings/[id]`
- Validate payload with Zod.

#### Capacity handling rule
- If the booking stays in the same slot:
  - update record only
- If the booking moves to a different slot:
  - restore capacity to the old slot
  - consume capacity from the new slot
  - update the booking only if the new slot has enough remaining capacity

#### Safety requirement
- Capacity-sensitive booking edits must be enforced server-side.
- Current implementation uses guarded slot-availability updates inside `PATCH /api/admin/bookings/[id]` for same-date slot moves and guest-count changes.
- A dedicated Postgres RPC remains a later hardening option if admin booking edits expand beyond the current scope.

### Phase 7: Validation and Server Interfaces

#### Internal admin routes to add
- `PUT /api/admin/members/[id]`
- `DELETE /api/admin/members/[id]`
- `PATCH /api/admin/bookings/[id]`

#### Validation modules
- Add dedicated admin schemas for:
  - member update
  - booking update
  - admin login/reset form data where useful

#### Shared server rules
- All admin routes require:
  - valid authenticated session
  - allowlisted email
- All writes use server-side Supabase access.
- Client components must not call privileged Supabase writes directly.

## Data and Interface Changes

### Environment variables
- Add or document:
  - `ADMIN_EMAIL_ALLOWLIST`

### Database
- `bookings.guest_count` added with default `1`
- `payment_references` added for membership/booking reference persistence

### Routes
- Add:
  - `/admin/reset-password`
  - `/admin/bookings/[date]`

### Internal API surface
- Add:
  - `PUT /api/admin/members/[id]`
  - `DELETE /api/admin/members/[id]`
  - `PATCH /api/admin/bookings/[id]`

## Testing Plan

### Auth
- Redirect unauthenticated users from protected admin pages.
- Allow allowlisted admin users through.
- Reject authenticated non-allowlisted users.
- Verify password reset request flow.
- Verify reset-password completion flow.

### Members
- Search filters the list correctly.
- Member update persists all supported fields.
- Status can be switched between `pending` and `active`.
- Invalid payloads are rejected.
- Delete is blocked for members with bookings.

### Dashboard
- Members card shows correct totals.
- Bookings card shows correct total bookings.

### Bookings
- Calendar shows correct counts by date.
- Location filter narrows the counts.
- Date detail page groups bookings under the correct slot.
- Booking move updates slot capacity correctly.
- Over-capacity moves fail without partial updates.

### Regression coverage
- Public booking creation now persists `guest_count`.
- Existing active-membership enforcement still blocks pending members from booking.

## Documentation Updates Required During Implementation
- Update `docs/SYSTEM_ARCHITECTURE.md` to reflect:
  - email/password admin auth
  - password reset flow
  - allowlist protection
  - booking date-detail route
  - `guest_count` persistence
- Update `docs/IMPLEMENTATION_ROADMAP.md` so milestone 5 matches the implemented admin scope.
- Update any architecture or operational docs affected by the final auth/session implementation details.

## Delivery Order
1. Add admin auth/session helpers and route protection.
2. Replace dashboard placeholder with real summary cards.
3. Implement member list, search, edit, and delete flows.
4. Add `guest_count` migration and persist it in public booking creation.
5. Implement bookings calendar page.
6. Implement booking date detail page and booking amendment flow.
7. Update docs and add automated coverage.

## Acceptance Criteria
- Only authenticated allowlisted admins can access protected admin pages.
- Admins can log in and reset their password.
- Dashboard shows working members and bookings summary cards.
- Members page supports search, edit, status change, and safe delete.
- Bookings page supports location filtering and date-count calendar navigation.
- Date detail page shows booked slots and members for the selected date.
- Booking updates respect slot capacity.
- Documentation is updated for the final shipped implementation.
