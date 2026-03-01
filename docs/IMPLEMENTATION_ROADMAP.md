# GYLounge Implementation Roadmap

## Purpose
This roadmap converts `docs/PROJECT_OVERVIEW.md` into a build sequence with milestones, ownership boundaries, and acceptance criteria.

## Delivery Strategy
- Ship vertical slices in the order users experience them.
- Keep business rules server-enforced.
- Reuse `lib/*` modules as the stable integration boundary.
- Keep `/` as the default landing and route public operational workflows through `/home`.

Current implementation note:
- `/home` Register and Booking forms now submit through server actions with in-page status feedback.

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
- Reuse existing form components for register and booking sections.

Key outputs:
- Stable one-page public home experience with expandable sections.

Acceptance criteria:
- `/home` renders all four accordions with their section content.
- Layout works on desktop and mobile without route switching for register/booking/FAQ/contact content.

## Milestone 2: Membership Flow (Bank Transfer)
Scope:
- Wire the `Register` accordion on `/home` to pending membership creation.
- Keep dedicated `/membership` and `/membership/pending` routes as scaffolds until migration decisions are final.
- Send membership bank-transfer instructions email.

Key outputs:
- Server action or route handler for membership intent creation.
- Unique `bank_transfer_reference` persisted per member.

Acceptance criteria:
- Register submission creates member with `status = 'pending'`.
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

## Milestone 4: Dedicated Event and Lookup Routes
Scope:
- Build `/events` and `/events/[eventId]` for dedicated event browsing.
- Build `/my-bookings` email lookup.
- Return privacy-safe booking projection.

Key outputs:
- Read-only event browsing experience.
- Email-based booking retrieval flow.

Acceptance criteria:
- Users can browse events by location and view event details.
- Valid email returns that member's bookings.
- Response excludes unnecessary PII.

## Milestone 5: Admin Console
Scope:
- Build `/admin/login`, `/admin`, `/admin/members`, `/admin/bookings`, `/admin/events`, `/admin/slots`.
- Enforce Supabase-authenticated admin access.
- Implement member activation (`pending` to `active`).
- Implement events/slots/bookings management operations.

Key outputs:
- Protected admin workspace.
- Member activation path used for bank-transfer verification.

Acceptance criteria:
- Non-admin is blocked from `/admin/*`.
- Admin can activate members and manage events/slots/bookings.

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
- `events`
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
- Unit tests for `lib/supabase.ts` and `lib/resend.ts`.

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
