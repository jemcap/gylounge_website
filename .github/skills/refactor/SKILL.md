---
name: refactor
description: "Refactor the GYLounge codebase. Use when: refactoring code, simplifying logic, extracting components, fixing naming conventions, reorganizing folders, modularizing code, removing duplication, cleaning up imports, improving file structure."
---

# Codebase Refactoring

Systematic refactoring workflow for the GYLounge codebase. Addresses duplicated logic, oversized components, naming inconsistencies, and folder structure issues.

## When to Use

- Removing duplicated logic across files
- Extracting components from large files
- Fixing naming convention inconsistencies
- Reorganizing folder structure and file placement
- Consolidating shared utilities

## Procedure

1. **Read the audit** — Load [./references/audit.md](./references/audit.md) to see all cataloged issues with file paths, code samples, and priority.
2. **Pick a phase** — Ask the user which phase to work on, or proceed with the highest-priority unfinished phase.
3. **Read affected files** — Before any edit, read every file listed in the chosen phase.
4. **Make one change at a time** — Each extraction, rename, or move is a single focused step. Run typecheck after each step.
5. **Update imports** — After moving or renaming a file, grep for all old import paths and update them.
6. **Run verification** — `npm run build` after each phase to catch breakage.
7. **Update tests** — If imports changed in test files, update those too. Run `npm run test` to confirm.
8. **Mark progress** — Update CONTINUITY.md with what was completed.

## Phases

Work through these in order. Each phase is independent and can be committed separately.

### Phase 1: Critical Duplication Removal

Extract duplicated one-liners and small utilities into shared modules.

**Targets:**
- `normalizeEmail` — duplicated in `lib/membership.ts` and `lib/admin-member.ts`
- `getSingleParam` — duplicated in `lib/booking-confirmation.ts` and `app/home/home-page-helpers.ts`
- `feedbackClassMap` — duplicated in `MembershipForm.tsx`, `BookingForm.tsx`, `AdminMembersManager.tsx`

**Actions:**
1. Keep `normalizeEmail` in `lib/membership.ts`, import it in `lib/admin-member.ts`
2. Extract `getSingleParam` to `lib/query-params.ts`, update both consumers
3. Extract `feedbackClassMap` to `lib/feedback-styles.ts`, update all three consumers

**Verify:** `npm run build && npm run test`

### Phase 2: Date/Time Logic Consolidation

Merge duplicated date formatting and month math into shared modules.

**Targets:**
- Date formatting in `app/home/home-page-helpers.ts` and `lib/admin-bookings.ts`
- Month navigation in `components/forms/BookingForm.tsx` and `lib/admin-bookings.ts`
- Time sorting in `app/home/home-page-helpers.ts` and `components/forms/BookingForm.tsx`
- Birthday validation in `lib/membership-form.ts` and `lib/admin-member.ts`

**Actions:**
1. Create `lib/date-formatting.ts` with `formatDateWithOrdinal()`, `formatTimeInAccra()`, `getOrdinalSuffix()`
2. Create `lib/date-math.ts` with `toMonthKey()`, `monthKeyToDate()`, `addMonths()`
3. Create `lib/time-sorting.ts` with `getTimeSortValue()`
4. Create `lib/date-validation.ts` with `createBirthdaySchema()`
5. Update all consumers to import from shared modules

**Verify:** `npm run build && npm run test`

### Phase 3: Component Extraction

Break oversized components into focused, single-responsibility pieces.

**Targets:**
- `components/admin/AdminMembersManager.tsx` (~400 lines)
- `components/forms/BookingForm.tsx` (~200 lines)

**Actions for AdminMembersManager:**
1. Extract inline `MemberTextField` → `components/admin/MemberTextField.tsx`
2. Extract inline `MemberSelectField` → `components/admin/MemberSelectField.tsx`
3. Extract member edit drawer → `components/admin/MemberProfileDrawer.tsx`
4. Keep search, pagination, and table in `AdminMembersManager.tsx`

**Actions for BookingForm:**
1. Extract month navigation UI → `components/forms/MonthNavigator.tsx`
2. Extract slot grouping/rendering → `components/forms/BookingSlotPicker.tsx`
3. Move slot helper functions to `lib/booking-helpers.ts`

**Actions for Feedback:**
1. Create `components/ui/FeedbackAlert.tsx` — shared feedback display with tone styling
2. Replace inline feedback blocks in `MembershipForm`, `BookingForm`, `AdminMembersManager`

**Verify:** `npm run build && npm run test`

### Phase 4: Folder Reorganization

Move files into logical subdirectories.

**lib/ restructure:**
```
lib/
├── admin/
│   ├── allowlist.server.ts
│   ├── auth.ts
│   ├── booking.ts
│   ├── member.ts
│   └── session.ts
├── booking/
│   ├── confirmation.ts
│   ├── form.ts
│   ├── helpers.ts
│   └── idempotency.ts
├── membership/
│   ├── form.ts
│   └── index.ts
├── supabase/
│   ├── browser.ts
│   ├── server.ts
│   └── index.ts
├── date-formatting.ts
├── date-math.ts
├── date-validation.ts
├── feedback-styles.ts
├── query-params.ts
├── resend.ts
└── time-sorting.ts
```

**app/home/components/ restructure:**
```
app/home/components/
├── layout/
│   ├── HomeHeader.tsx
│   ├── HomeSectionShell.tsx
│   └── HomeRouteAutoScroll.tsx
├── landing/
│   ├── PublicLandingSection.tsx
│   └── LandingPageCtas.tsx
├── sections/
│   ├── HomeDefaultContent.tsx
│   ├── BookingAccordionContent.tsx
│   ├── HomeFaqContent.tsx
│   └── HomeContactContent.tsx
├── navigation/
│   ├── HomeMobileMenu.tsx
│   └── HomeMobileMenuContext.tsx
├── dialogs/
│   └── BookingConfirmationModal.tsx
├── AccordionItem.tsx
├── HomeAccordionSection.tsx
├── PublicHomeExperience.tsx
└── PublicSiteExperience.tsx
```

**components/ cleanup:**
- Move `components/hero/TimePill.tsx` → `components/ui/time-pill.tsx`
- Remove empty `components/hero/` directory

**Actions:**
1. Create new subdirectories
2. Move files one directory at a time
3. After each move, grep for old import paths and update all references
4. Delete empty old directories

**Verify:** `npm run build && npm run test`

### Phase 5: Naming Cleanup

Fix inconsistent naming across the codebase.

**File renames:**
- `lib/admin-bookings.ts` → singular `admin-booking.ts` (or `lib/admin/booking.ts` if Phase 4 done)

**Type naming standardization:**
- Input types: `*FormValues` (what user enters)
- Output types: `*UpdateInput` (after Zod transform)
- Audit all `z.infer` / `z.input` / `z.output` usage for consistency

**Verify:** `npm run build && npm run test`

### Phase 6: home-page-helpers.ts Decomposition

Split the overloaded `app/home/home-page-helpers.ts` into focused modules.

**Current concerns mixed in one file:**
- Type definitions
- Date formatting utilities
- Query parameter extraction
- Feedback resolution logic
- Data fetching orchestration

**Actions:**
1. Move types (`BookableLocation`, `AvailableSlot`, `Feedback`) → `app/home/types.ts`
2. Date formatting already extracted in Phase 2
3. Query params already extracted in Phase 1
4. Move `resolveRegisterFeedback` → `app/home/feedback.ts` (or keep if small)
5. Keep only `loadPublicBookingData` in `home-page-helpers.ts`

**Verify:** `npm run build && npm run test`

## Rules

- **One phase per session** — Don't mix phases. Complete and commit one before starting the next.
- **Read before edit** — Always read the full file before modifying.
- **Grep after rename** — After any file move or rename, run `grep -r "old-path"` to find stale imports.
- **No behavior changes** — Refactoring must not change functionality. Tests must pass before and after.
- **Minimal diffs** — Move code as-is first, then clean up in a follow-up if needed.
- **Commit per phase** — Use the `git-commit` skill with prefix `refactor`.
