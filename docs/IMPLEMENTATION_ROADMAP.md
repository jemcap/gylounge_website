# GYLounge Implementation Roadmap

## Purpose
This roadmap converts `docs/PROJECT_OVERVIEW.md` into a build sequence with milestones, ownership boundaries, and acceptance criteria.

## Delivery Strategy
- Ship vertical slices in the order users experience them.
- Keep business rules server-enforced.
- Reuse `lib/*` modules as the stable integration boundary.
- Keep `/` as the default landing and route public operational workflows through `/home`.

Current implementation note:
- `/register` now owns membership sign-up submissions; `/home` keeps booking server-action flow.

## Milestone 0: Foundation
Scope:
- Confirm environment variables and secret handling.
- Ensure Supabase types are up to date.
- Establish base route skeleton for planned pages.
- Keep docs and architecture synchronized.

Key outputs:
- `.env.local` contract validated.
- `app/types/database.ts` generated and committed.
- Empty route stubs created for target pages.

Acceptance criteria:
- App boots locally.
- Core libs (`lib/supabase.ts`, `lib/membership.ts`, `lib/resend.ts`) compile and tests pass.

## Milestone 1: Public Home Hub
Scope:
- Build `/home` with a simple top navbar (logo left, live time pill right).
- Build accordion sections for `Register`, `Booking`, `FAQs`, and `Contact Us`.
- Keep Register as a gateway section on `/home` that links to dedicated `/register`.

Key outputs:
- Stable one-page public home experience with expandable sections.

Acceptance criteria:
- `/home` renders all four accordions with their section content.
- Layout works on desktop and mobile, with Register navigating to `/register` for membership submission.

## Milestone 2: Membership Flow (Bank Transfer)
Scope:
- Wire `/register` to pending membership creation.
- Keep dedicated `/membership` and `/membership/pending` routes as scaffolds until migration decisions are final.
- Send membership bank-transfer instructions email.

Key outputs:
- Server action or route handler for membership intent creation.
- Unique payment reference persisted in a dedicated references table linked to the member.

Acceptance criteria:
- `/register` submission creates member with `status = 'pending'`.
- User sees and receives bank details + reference.

## Milestone 3: Booking Flow
Scope:
- Wire the `Booking` accordion on `/home` to booking server actions.
- Enforce active membership check by normalized email.
- Reserve slot atomically and insert booking.
- Send booking confirmation and organizer notification emails.

Key outputs:
- `createBooking` flow with transactional guard.
- `/home` booking UX backed by server logic.

Acceptance criteria:
- Active member can book successfully.
- Pending/non-member is redirected to `/home#register`.
- Slot overbooking is prevented.
- Booking confirmation and notification emails are attempted after booking persistence.

## Milestone 4: Dedicated Booking and Lookup Routes
Scope:
- Keep `/events` as a redirect into the live booking flow, or replace it with a dedicated location-availability landing page later.
- Build `/my-bookings` email lookup.
- Return privacy-safe booking projection.

Key outputs:
- Read-only booking lookup experience.
- Email-based booking retrieval flow.

Acceptance criteria:
- Users can reach booking from `/events` without leaving the active booking model.
- Valid email returns that member's bookings.
- Response excludes unnecessary PII.

## Milestone 5: Admin Console
Scope:
- Phase 1 implemented:
  - `@supabase/ssr` admin auth helpers for browser, server, server-action, and proxy contexts
  - `/admin/login` email/password sign-in and password-reset request flow
  - `/admin/reset-password` recovery completion page
  - root `proxy.ts` protection for `/admin/*`
  - protected placeholders for `/admin`, `/admin/members`, `/admin/bookings`, `/admin/bookings/[date]`, `/admin/events`, and `/admin/slots`
- Remaining admin console work:
  - dashboard summary cards
  - member activation and member management operations
  - booking calendar and booking detail management
  - later location and slot management operations

Key outputs:
- Protected admin auth boundary with login, logout, allowlist checks, and password recovery.
- Protected admin workspace ready for the later member and booking management slices.

Acceptance criteria:
- Non-admin is blocked from `/admin/*`.
- Allowlisted admins can sign in, request a reset email, complete password recovery, and sign out.
- Later milestone slices will add member and booking management behavior inside the protected shell.

## Milestone 6: Hardening and Release
Scope:
- Add tests for server actions and core flows.
- Apply input validation and error handling consistency.
- Prepare deployment checks and operational runbooks.

Key outputs:
- Extended test suite beyond `lib/*`.
- Release checklist for Vercel deployment.

Acceptance criteria:
- Lint/test pass.
- Critical flows are covered by automated tests.
- Production env vars documented and verified.

## Database Plan
Core schema remains:
- `members`
- `locations`
- `slots`
- `bookings`

Required integrity additions before full booking launch:
- Transaction/RPC for slot reservation.
- Supporting indexes for common lookup paths.

## API/Application Plan
Preferred pattern:
- Server Actions for form-driven mutations.
- Route Handlers for JSON consumption and admin operations.

Shared rule:
- Keep business logic centralized in reusable functions; UI layers should not duplicate rules.

## Testing Plan
Current:
- Unit tests for `lib/supabase.ts`, `lib/admin-auth.ts`, and `lib/resend.ts`.

Add next:
- Membership creation tests.
- Booking transaction tests.
- Admin authorization tests.
- My-bookings privacy projection tests.

## Operational Plan (Bank Transfer)
- Use unique references for all pending memberships.
- Verify transfer manually in admin workflow.
- Activate member only after verification.

## Definition of Done (Per Milestone)
- Feature implemented in target routes/modules.
- Tests for critical path behavior added or updated.
- Lint/test commands run and status recorded.
- Architecture docs updated for any scope or flow changes.
