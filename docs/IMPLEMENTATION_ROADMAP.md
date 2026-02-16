# GYLounge Implementation Roadmap

## Purpose
This roadmap converts `docs/PROJECT_OVERVIEW.md` into a build sequence with milestones, ownership boundaries, and acceptance criteria.

## Delivery Strategy
- Ship vertical slices in the order users experience them.
- Keep business rules server-enforced.
- Reuse `lib/*` modules as the stable integration boundary.

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

## Milestone 1: Event Catalog
Scope:
- Build `/events` with location filtering and event cards.
- Build `/events/[eventId]` for event + slot display.

Key outputs:
- Read-only event browsing experience.
- Stable query patterns for `events`, `locations`, and `slots`.

Acceptance criteria:
- Users can browse events by location.
- Event detail view shows slots and event metadata.

## Milestone 2: Membership Flow (Bank Transfer)
Scope:
- Build `/membership` and `/membership/pending`.
- Implement pending membership creation with reference generation.
- Send membership bank-transfer instructions email.

Key outputs:
- Server action or route handler for membership intent creation.
- Unique `bank_transfer_reference` persisted per member.

Acceptance criteria:
- Membership intent creates member with `status = 'pending'`.
- User sees and receives bank details + reference.

## Milestone 3: Booking Flow
Scope:
- Implement booking mutation endpoint/server action.
- Enforce active membership check by normalized email.
- Reserve slot atomically and insert booking.
- Send booking confirmation and organizer notification emails.

Key outputs:
- `createBooking` flow with transactional guard.
- `/booking/confirm` completion UX.

Acceptance criteria:
- Active member can book successfully.
- Pending/non-member is redirected to membership flow.
- Slot overbooking is prevented.

## Milestone 4: My Bookings
Scope:
- Build `/my-bookings` email lookup.
- Return privacy-safe booking projection.

Key outputs:
- Email-based booking retrieval flow.

Acceptance criteria:
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
