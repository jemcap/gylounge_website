# Booking Event & Slot Selection Implementation Guide

## Purpose
This guide walks you through enhancing the booking workflow on `/home` so users can:
- select an upcoming event from a dropdown,
- pick an available time slot from a radio list,
- submit a booking for a pre-seeded slot with multi-member capacity limits.

This approach adds **zero new dependencies**, builds on the existing `slotId`-based flow, and keeps the UX to two selection steps — ideal for the elderly target audience.

## Design Rationale (Why Not a Calendar?)
An earlier draft of this guide proposed a full calendar date picker with on-demand slot creation. That approach was rejected for the following reasons:

| Concern | Calendar approach | This approach |
|---|---|---|
| New dependencies | `react-day-picker`, `date-fns`, shadcn primitives | **None** |
| Slot creation | On-demand in booking action (race condition risk) | Pre-seeded by admin (no race) |
| Event date vs. calendar date | Users pick any date (confusing for single-day events) | Date comes from the event itself |
| Files changed | ~8-10 files, major refactor | ~3-4 files, incremental change |
| UX complexity | Dropdown → calendar → slot picker (3 steps) | Dropdown → slot picker (2 steps) |
| Concurrency safety | App-level optimistic update + slot creation race | Same decrement pattern, no creation race |

If events later become recurring (e.g., "Yoga every Tuesday"), a calendar approach can be revisited. For single-date events, the simpler model is correct.

## Final Product Requirements
- Booking UI includes:
  - event dropdown (upcoming events with available slots),
  - time-slot radio group (pre-seeded slots for the selected event).
- Multiple members can book the same slot until `available_spots` reaches zero.
- `available_spots` is initialized from `events.capacity` when admin creates slots.
- Booking submission remains server-enforced (membership status, slot availability, booking insert).
- Post-submit UX remains on `/home#booking` with inline status feedback.

## Existing Baseline (Before You Start)
- `app/home/page.tsx` — loads booking accordion and handles status query params.
- `app/home/home-page-helpers.ts` — contains `getBookingTarget()` (current single-slot lookup) and status-message mapping.
- `components/forms/BookingForm.tsx` — currently accepts `eventId`, `slotId`, and personal fields.
- `app/home/components/BookingAccordionContent.tsx` — renders `BookingForm` or a no-slots fallback.
- `app/home/actions.ts` — handles booking action with membership check, slot decrement, and booking insert.
- DB tables: `events`, `slots`, `bookings`, `members` in `app/types/database.ts`.

Read these files first before coding:
- `app/home/page.tsx`
- `app/home/home-page-helpers.ts`
- `app/home/components/BookingAccordionContent.tsx`
- `components/forms/BookingForm.tsx`
- `app/home/actions.ts`
- `lib/supabase.ts`
- `app/types/database.ts`

## Phase 1: Data Loading — Fetch Events With Available Slots

### Task 1.1: Create a helper to load bookable events
Files:
- `app/home/home-page-helpers.ts`

What to do:
- Add a new async function `getBookableEvents()` that queries upcoming events joined with their available slots.
- For each event, return: `id`, `title`, `date`, `locationName`, and an array of available slots (`id`, `start_time`, `end_time`, `available_spots`).
- Filter to events that have at least one slot with `available_spots > 0`.
- Sort events by date ascending, slots by `start_time` ascending.

Concept:
- **Why a single query with joins?** Fetching events and slots together avoids N+1 queries. Supabase's `select` with embedded relations (`slots(...)`) lets you do this in one call.
- **Why filter server-side?** The server component fetches this data once per page load. Sending only bookable events to the client keeps the payload small and avoids showing unbookable options.

Example query shape:
```ts
const { data: events } = await admin
  .from("events")
  .select(`
    id, title, date, location_id,
    locations(name),
    slots!inner(id, start_time, end_time, available_spots)
  `)
  .gt("slots.available_spots", 0)
  .gte("date", todayISOString)
  .order("date", { ascending: true });
```

Note: The `!inner` modifier on `slots` ensures only events with matching slots are returned (acts like an INNER JOIN). Without it, events with zero available slots would still appear with empty slot arrays.

Acceptance:
- Function returns a typed array of events, each with a nested array of available slots.
- Events with no available slots are excluded.
- The existing `getBookingTarget()` function can remain for now (or be deprecated later).

### Task 1.2: Define a type for the bookable event data
Files:
- `app/home/home-page-helpers.ts`

What to do:
- Add a `BookableEvent` type:
```ts
export type AvailableSlot = {
  id: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
};

export type BookableEvent = {
  id: string;
  title: string;
  date: string;
  locationName: string;
  slots: AvailableSlot[];
};
```

Concept:
- **Why define explicit types instead of using Supabase's inferred types?** The Supabase query return type includes nullable fields and nested relation shapes that are awkward to pass to UI components. Mapping to a clean application type at the helper boundary keeps components simple and decoupled from the database schema.

Acceptance:
- `getBookableEvents()` returns `BookableEvent[]`.

## Phase 2: UI — Event Dropdown + Slot Picker

### Task 2.1: Refactor BookingForm to accept event options
Files:
- `components/forms/BookingForm.tsx`

What to do:
- Add a new prop: `events: BookableEvent[]` (the full list of bookable events with their slots).
- Replace the hidden `eventId` input with a `<select>` dropdown.
- Each `<option>` displays: `"{title} — {locationName} — {formatted date}"`.
- When the user selects an event, display that event's available slots as a radio group below the dropdown.

Concept:
- **Why a `<select>` and not a custom dropdown?** Native `<select>` is fully accessible out of the box (screen readers, keyboard navigation, mobile-friendly). For an elderly audience, native controls are more familiar and reliable than custom-built alternatives.
- **Why does this component need `'use client'`?** The event dropdown and slot radio group require interactive state (selected event, selected slot). Server Components can't hold React state, so this form must be a Client Component. However, the *data* is still fetched server-side and passed down as props.

Implementation sketch:
```tsx
'use client';

import { useState } from 'react';
import type { BookableEvent } from '@/app/home/home-page-helpers';

// Inside the component:
const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? '');
const selectedEvent = events.find(e => e.id === selectedEventId);
```

Acceptance:
- Changing the event dropdown updates the visible slot options.
- No new packages installed.

### Task 2.2: Build the slot radio group
Files:
- `components/forms/BookingForm.tsx` (inline) or `components/booking/SlotRadioGroup.tsx` (extracted)

What to do:
- Render each available slot as a radio input: `"09:00 – 10:00 (3 spots left)"`.
- Use `slot.id` as the radio value — this is what gets submitted as `slotId`.
- Format times using `Intl.DateTimeFormat` with `Africa/Accra` timezone (reuse the `formatAccraTime` pattern already in the codebase).
- Style with Tailwind: clear borders, large touch targets (minimum 44×44px), high contrast text.

Concept:
- **Why radio inputs and not buttons?** Radio groups have built-in single-selection semantics (only one can be active). This means correct keyboard behavior (arrow keys to switch), correct form submission (selected value is included in `FormData`), and correct accessibility announcements — all for free. Custom button groups require reimplementing all of this.
- **Why show spots remaining?** It sets expectations and creates gentle urgency without pressure. Elderly users appreciate transparent availability.

Acceptance:
- Selecting a slot stores `slotId` in form state and includes it in submission.
- Slots with zero spots are either hidden (already filtered server-side) or shown as disabled with "(Full)" label.

### Task 2.3: Update BookingAccordionContent to pass events
Files:
- `app/home/components/BookingAccordionContent.tsx`
- `app/home/page.tsx`

What to do:
- Change `BookingAccordionContent` props to accept `events: BookableEvent[]` instead of `bookingTarget: BookingTarget | null`.
- If `events` is empty, show the existing no-slots fallback card.
- If `events` has entries, render `BookingForm` with the events list.
- In `page.tsx`, call `getBookableEvents()` and pass the result down.

Concept:
- **Why change the prop shape?** The current `bookingTarget` is a single pre-chosen slot. The new UX requires passing multiple events with multiple slots so the *user* makes the selection. The data flows: `page.tsx (server) → BookingAccordionContent (server) → BookingForm (client)`.

Acceptance:
- Booking accordion shows event dropdown + slot picker when events exist.
- Booking accordion shows fallback card when no events are available.

## Phase 3: Server Action — Minimal Changes

### Task 3.1: Validate the booking payload
File:
- `app/home/actions.ts`

What to do:
- The `createBookingAction` already accepts `eventId` and `slotId` from `FormData`. Confirm these are still read correctly.
- Add an explicit check that the submitted `slotId` belongs to the submitted `eventId` (the current code already does this via `.eq("id", slotId).eq("event_id", eventId)`).
- Keep the existing validations: required fields, email normalization, active membership check.

Concept:
- **Why validate slot-event ownership server-side?** A malicious or buggy client could submit a `slotId` from a different event. The existing `.eq("event_id", eventId)` check already prevents this. This task is about confirming that protection is in place, not adding new code.

Acceptance:
- No changes needed if the existing action already validates `slotId + eventId`.
- If it doesn't, add the check.

### Task 3.2: Capacity enforcement (already implemented)
File:
- `app/home/actions.ts`

What to do:
- Verify the existing optimistic decrement pattern still works:
  ```ts
  .update({ available_spots: availableSlot.available_spots - 1 })
  .eq("id", availableSlot.id)
  .eq("available_spots", availableSlot.available_spots)
  ```
- This ensures that if two users race to book the last spot, only one succeeds.
- The compensation pattern (restoring `available_spots` if booking insert fails) is already in place.

Concept:
- **How does this prevent overbooking?** The `WHERE available_spots = X` clause acts as an optimistic lock. If another request decremented first, `X` no longer matches and the UPDATE returns zero rows — which the code detects and returns `slot-unavailable`. This is a standard pattern for low-contention inventory management without database-level locks.

Acceptance:
- No code changes expected. This task is a verification checkpoint.

## Phase 4: Admin Slot Seeding (Prerequisite)

### Task 4.1: Add bulk slot generation to admin events panel
Files:
- `app/admin/slots/page.tsx` (or a new admin action)

What to do:
- When an admin creates or edits an event, provide a "Generate hourly slots" action.
- Generate one-hour slots from `09:00` to `21:00` (last slot starts `20:00`, ends `21:00`) → **12 slots per event**.
- Each slot gets:
  - `event_id` = the event's ID
  - `start_time` = event date + hour (Accra timezone, UTC+0)
  - `end_time` = start_time + 1 hour
  - `available_spots` = `events.capacity`

Concept:
- **Why admin-seeded instead of on-demand?** On-demand slot creation in the booking action introduces a race condition: two simultaneous users could both see "no slot row exists" and both try to INSERT. You'd need a database `UNIQUE` constraint with `ON CONFLICT` upsert or advisory locks to handle this safely. Pre-seeding by admin eliminates this entire class of bugs.
- **Why 09:00–21:00?** This is the operating window. It can be made configurable later, but hardcoding it now keeps the implementation simple.

Helper function (recommended in `lib/booking-slots.ts`):
```ts
export function generateHourlySlots(eventDate: string, capacity: number) {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    const hh = String(hour).padStart(2, '0');
    const nextHh = String(hour + 1).padStart(2, '0');
    slots.push({
      start_time: `${eventDate}T${hh}:00:00+00:00`,
      end_time: `${eventDate}T${nextHh}:00:00+00:00`,
      available_spots: capacity,
    });
  }
  return slots;
}
```

Acceptance:
- Admin can generate all hourly slots for an event in one action.
- Generated slots appear in the database and are visible in the booking form.

## Phase 5: Feedback UX and Fallbacks

### Task 5.1: Booking feedback (already implemented)
File:
- `app/home/page.tsx`

What to do:
- Confirm existing feedback parsing still works:
  - `booking=success` → green success message
  - `booking=success-email-warning` → info message
  - `booking=membership-required` → info message
  - `booking=slot-unavailable` → error message
  - `booking=invalid` → error message
  - `booking=error` → error message
- Keep booking accordion auto-open when feedback exists.

Concept:
- **Why query-param feedback instead of client state?** The server action uses `redirect()`, which triggers a full navigation. Query params survive the redirect and let the server component render the correct message without client-side state management. This is the standard Next.js App Router pattern for server action feedback.

Acceptance:
- No code changes expected unless the feedback key names change.

### Task 5.2: No-events fallback
File:
- `app/home/components/BookingAccordionContent.tsx`

What to do:
- If no upcoming events with available slots exist, show the existing fallback card: "No bookable slots right now."
- This is already implemented. Verify it still works with the new `events: BookableEvent[]` prop (empty array triggers fallback).

Acceptance:
- Booking section gracefully handles zero events.

## Phase 6: Testing Strategy

### Task 6.1: Unit tests for slot generation helper
Files:
- `__tests__/lib/booking-slots.test.ts` (new)

What to test:
- `generateHourlySlots` produces exactly 12 slots.
- First slot starts at `09:00`, last slot starts at `20:00`.
- Each slot is exactly 1 hour.
- `available_spots` matches the provided capacity.

### Task 6.2: Action-level behavior tests
Files:
- `__tests__/lib/booking-action.test.ts` (new or extend existing)

What to test:
- Active member + available slot → booking created, spots decremented.
- Non-active member → `membership-required` redirect.
- Slot with zero available spots → `slot-unavailable` redirect.
- `slotId` that doesn't belong to `eventId` → `slot-unavailable` redirect.
- Missing required fields → `invalid` redirect.

### Task 6.3: Manual QA checklist
- [ ] Select an event from the dropdown.
- [ ] See available slots update to match the selected event.
- [ ] Pick a time slot from the radio group.
- [ ] Book successfully as an active member.
- [ ] Rebook the same slot until sold out; verify limit enforcement.
- [ ] Verify feedback messages display correctly for each status.
- [ ] Verify mobile layout: large touch targets, readable text.
- [ ] Verify keyboard navigation: tab to dropdown, arrow keys in radio group.

## Phase 7: Verification Commands
Run after implementation:
```bash
npm run lint
npm run test
./node_modules/.bin/next build --webpack
```

If a check fails:
- Fix type/logic issues first.
- Rerun all three to confirm no regressions.

## Phase 8: Documentation and Continuity

### Task 8.1: Update architectural docs
Update only where necessary:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/PROJECT_OVERVIEW.md`

Focus:
- Booking flow now includes event dropdown + slot radio picker.
- Admin seeds hourly slots per event.
- Capacity enforcement uses `events.capacity` as the initial `available_spots` value.

### Task 8.2: Update continuity file
File:
- `.agent/CONTINUITY.md`

Add:
- Decision: pre-seeded slots over on-demand creation (concurrency rationale).
- Decision: no calendar dependency — native `<select>` + radio group for elderly UX.
- Progress details for changed components and any new helpers.
- Outcome and verification command evidence.

## Summary of Files Changed

| File | Change type | What changes |
|---|---|---|
| `app/home/home-page-helpers.ts` | Modified | Add `BookableEvent` type and `getBookableEvents()` |
| `app/home/page.tsx` | Modified | Call `getBookableEvents()`, pass to accordion |
| `app/home/components/BookingAccordionContent.tsx` | Modified | Accept `events[]` instead of single `bookingTarget` |
| `components/forms/BookingForm.tsx` | Modified | Add `'use client'`, event dropdown, slot radio group |
| `lib/booking-slots.ts` | New | `generateHourlySlots()` helper for admin use |
| `app/admin/slots/page.tsx` | Modified | Add bulk slot generation action |
| `__tests__/lib/booking-slots.test.ts` | New | Tests for slot generation |

**No changes to `app/home/actions.ts`** — the existing `createBookingAction` already accepts `eventId` + `slotId` and handles capacity enforcement correctly.

## Common Pitfalls to Avoid
- **Forgetting `'use client'` on BookingForm.** The event dropdown and slot picker require `useState`. Without the directive, React will throw a server component error.
- **Not using `!inner` in the Supabase join.** Without it, events with zero available slots will appear in the list with empty slot arrays.
- **Mixing timezone formats when displaying slot times.** Always use `Intl.DateTimeFormat` with `Africa/Accra` — never `toLocaleTimeString()` without an explicit timezone.
- **Forgetting empty-state behavior** when no events have available slots.
- **Creating slots with wrong timezone offset.** Ghana is UTC+0. Slot timestamps should use `+00:00` suffix, not the server's local timezone.

## Mentor Notes (Implementation Mindset)
- **Build on what works.** The existing `slotId`-based action is solid. The only real change is *who picks the slot* — previously the system picked the first available; now the user picks from a list.
- **Separate data fetching from interaction.** The server fetches events + slots once (read-only). The client handles selection (interactive). The server action handles mutation (write). This three-layer split is the core App Router pattern.
- **Start with the data, then build the UI.** Implement `getBookableEvents()` first and log the output. Once you can see the data shape, building the dropdown and radio group is straightforward.
- **Test the seam, not the UI.** The most important tests are at the helper and action level. If `getBookableEvents()` returns the right data and `createBookingAction` handles all edge cases, the UI is just wiring.

## Definition of Done for This Feature
- Booking flow on `/home` supports event dropdown + slot radio selection.
- Pre-seeded hourly slots follow 09:00–21:00 policy.
- Slot capacity allows multiple members up to event-defined limit.
- Overbooking is blocked by existing server logic.
- Lint, tests, and build pass.
- Architecture/docs/continuity are updated to reflect reality.
