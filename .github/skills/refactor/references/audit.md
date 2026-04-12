# Refactoring Audit — GYLounge Codebase

**Date:** 2026-04-12  
**Scope:** Full codebase (`app/`, `components/`, `lib/`, `types/`, `__tests__/`)

---

## 1. Duplicated Logic

### 1.1 Email Normalization

| File | Function | Code |
|------|----------|------|
| `lib/membership.ts` | `normalizeEmail()` | `email.trim().toLowerCase()` |
| `lib/admin-member.ts` | `normalizeMemberEmail()` | `email.trim().toLowerCase()` |

**Fix:** Remove `normalizeMemberEmail` from `lib/admin-member.ts`. Import `normalizeEmail` from `lib/membership.ts`.

---

### 1.2 Query Parameter Extraction

| File | Function | Code |
|------|----------|------|
| `lib/booking-confirmation.ts` | `getSingleParam()` | `Array.isArray(value) ? value[0] : value` |
| `app/home/home-page-helpers.ts` | `getSingleParam()` | `Array.isArray(value) ? value[0] : value` |

**Fix:** Create `lib/query-params.ts`:
```typescript
export const getSingleParam = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};
```

---

### 1.3 Feedback Class Map

Identical `feedbackClassMap` object in three files:

| File | Variable |
|------|----------|
| `components/forms/MembershipForm.tsx` | `feedbackClassMap` |
| `components/forms/BookingForm.tsx` | `feedbackClassMap` |
| `components/admin/AdminMembersManager.tsx` | `feedbackClassMap` |

**Current code (identical in all three):**
```typescript
const feedbackClassMap: Record<MembershipFeedback["tone"], string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};
```

**Fix:** Create `lib/feedback-styles.ts`:
```typescript
export const feedbackClassMap: Record<string, string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};
```

---

### 1.4 Date Formatting

| File | Functions | Purpose |
|------|-----------|---------|
| `app/home/home-page-helpers.ts` | `formatAccraDate()`, `formatAccraTime()` | Public booking UI |
| `lib/admin-bookings.ts` | `formatAdminBookingDateLabel()`, `formatAdminBookingTimeLabel()`, `formatAdminBookingTimeRangeLabel()` | Admin booking UI |

Both implement:
- Date parsing with `Africa/Accra` timezone
- Ordinal suffix logic (`1st`, `2nd`, `3rd`, etc.)
- Time formatting (`08:00 AM`)

**Fix:** Create `lib/date-formatting.ts` with shared implementations. ~60 lines of duplication eliminated.

---

### 1.5 Month Navigation Math

| File | Functions |
|------|-----------|
| `components/forms/BookingForm.tsx` | `toMonthKey()`, `monthKeyToUtcDate()`, `getMonthStartFromDateKey()`, `addMonths()` |
| `lib/admin-bookings.ts` | `toAdminBookingMonthKey()`, `getAdminBookingMonthStartFromMonthKey()`, `addAdminBookingMonths()` |

**Fix:** Create `lib/date-math.ts` with generic implementations. ~40 lines of duplication eliminated.

---

### 1.6 Time Sort Value

| File | Function |
|------|----------|
| `app/home/home-page-helpers.ts` | `getTimeSortValue()` |
| `components/forms/BookingForm.tsx` | `getSlotSortValue()` |

Both extract hour/minute/second from `HH:MM:SS` for numeric sorting.

**Fix:** Create `lib/time-sorting.ts` with shared `getTimeSortValue()`.

---

### 1.7 Birthday Validation

| File | Schema |
|------|--------|
| `lib/membership-form.ts` | Birthday validation in `membershipFormSchema` |
| `lib/admin-member.ts` | `birthdaySchema` with nearly identical logic |

Both implement:
- Parse day/month/year parts
- Validate date exists (Feb 29 edge case, etc.)
- Check not in future

**Fix:** Create `lib/date-validation.ts` with `createBirthdaySchema()` factory. ~50 lines of duplication eliminated.

---

## 2. Components to Modularize

### 2.1 AdminMembersManager.tsx (~400 lines)

**Location:** `components/admin/AdminMembersManager.tsx`

**Mixed concerns:**
- Pagination logic
- Search/filter logic
- Table rendering
- Dialog/drawer management
- Member edit form (150+ lines)
- Inline `MemberTextField` component (~40 lines)
- Inline `MemberSelectField` component (~30 lines)

**Extractions:**
| New File | What to Extract | Estimated Lines |
|----------|----------------|-----------------|
| `components/admin/MemberTextField.tsx` | Inline text input component | ~40 |
| `components/admin/MemberSelectField.tsx` | Inline select component | ~30 |
| `components/admin/MemberProfileDrawer.tsx` | Edit drawer + form + submission | ~150 |

---

### 2.2 BookingForm.tsx (~200 lines)

**Location:** `components/forms/BookingForm.tsx`

**Mixed concerns:**
- Month navigation state and UI (~80 lines)
- Slot filtering and grouping (~60 lines)
- Form state and submission (~40 lines)

**Extractions:**
| New File | What to Extract | Estimated Lines |
|----------|----------------|-----------------|
| `components/forms/MonthNavigator.tsx` | Month prev/next UI and state | ~80 |
| `components/forms/BookingSlotPicker.tsx` | Date-slot grouping and rendering | ~60 |
| `lib/booking-helpers.ts` | `groupSlotsByDate()`, `filterSlotsByLocation()` | ~40 |

---

### 2.3 FeedbackAlert (New Shared Component)

Replace inline feedback rendering blocks in three forms with one component.

**Target file:** `components/ui/FeedbackAlert.tsx`

**Current pattern repeated in 3 files:**
```tsx
{feedback && (
  <div className={`rounded border px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}>
    {feedback.message}
  </div>
)}
```

---

## 3. Naming Issues

### 3.1 File Names — Singular vs Plural

| Current | Recommended | Reason |
|---------|-------------|--------|
| `lib/admin-bookings.ts` | `lib/admin-booking.ts` | All other lib files use singular |

### 3.2 Type Naming — Inconsistent Zod Patterns

| Pattern | Usage | Files |
|---------|-------|-------|
| `z.infer<typeof schema>` | Most common | `lib/membership-form.ts`, `lib/booking-form.ts` |
| `z.input<typeof schema>` | Rare | `lib/admin-member.ts` |
| `z.output<typeof schema>` | Rare | `lib/admin-member.ts` |

**Convention to adopt:**
- `*FormValues` = `z.input<>` (what user enters, before transform)
- `*ValidatedData` = `z.output<>` (after transform)
- `*Schema` = the Zod schema object itself

---

## 4. Folder Structure Issues

### 4.1 lib/ — Flat with 14 Files

**Current:** All files at root level with `admin-*` prefix convention.

**Proposed:**
```
lib/
├── admin/           (5 files)
├── booking/         (3-4 files)
├── membership/      (2 files)
├── supabase/        (3 files)
├── date-formatting.ts
├── date-math.ts
├── date-validation.ts
├── feedback-styles.ts
├── query-params.ts
├── resend.ts
└── time-sorting.ts
```

**Import path changes:** Find with `grep -r "@/lib/admin-" --include="*.ts" --include="*.tsx"` and update.

---

### 4.2 app/home/components/ — Flat with 16 Files

**Current:** 16 files at same level using prefix convention (`Home*`, `Public*`).

**Proposed:**
```
app/home/components/
├── layout/          (HomeHeader, HomeSectionShell, HomeRouteAutoScroll)
├── landing/         (PublicLandingSection, LandingPageCtas)
├── sections/        (HomeDefaultContent, BookingAccordionContent, HomeFaqContent, HomeContactContent)
├── navigation/      (HomeMobileMenu, HomeMobileMenuContext)
├── dialogs/         (BookingConfirmationModal)
├── AccordionItem.tsx
├── HomeAccordionSection.tsx
├── PublicHomeExperience.tsx
└── PublicSiteExperience.tsx
```

---

### 4.3 components/hero/ — Underused

**Current:** Contains only `TimePill.tsx`.

**Fix:** Move `TimePill.tsx` → `components/ui/time-pill.tsx`, delete `hero/` directory.

---

### 4.4 components/forms/ — Growing Without Structure

**Current:** 10 files flat — 7 membership field components alongside `BookingForm.tsx` and `MembershipForm.tsx`.

**Proposed (optional):**
```
components/forms/
├── membership/
│   ├── MembershipForm.tsx
│   └── fields/
│       ├── MembershipNameFields.tsx
│       ├── BirthDateFields.tsx
│       └── ...
├── booking/
│   ├── BookingForm.tsx
│   ├── MonthNavigator.tsx
│   └── BookingSlotPicker.tsx
└── membership-form-styles.ts
```

---

## 5. File Placement Issues

### 5.1 home-page-helpers.ts — Too Many Concerns

**Location:** `app/home/home-page-helpers.ts` (~150 lines)

**Contains (should be separated):**

| Concern | Current Location | Recommended Location |
|---------|-----------------|---------------------|
| Type definitions (`BookableLocation`, `AvailableSlot`, `Feedback`) | `home-page-helpers.ts` | `app/home/types.ts` |
| Date formatting (`formatAccraDate`, `formatAccraTime`) | `home-page-helpers.ts` | `lib/date-formatting.ts` |
| Query params (`getSingleParam`) | `home-page-helpers.ts` | `lib/query-params.ts` |
| Feedback resolution (`resolveRegisterFeedback`) | `home-page-helpers.ts` | Keep or move to `app/home/feedback.ts` |
| Data fetching (`loadPublicBookingData`) | `home-page-helpers.ts` | Keep (page-specific) |

---

## 6. Priority Matrix

| # | Issue | Priority | Effort | Phase |
|---|-------|----------|--------|-------|
| 1.1 | Email normalization duplicate | CRITICAL | Trivial | 1 |
| 1.2 | getSingleParam duplicate | HIGH | Trivial | 1 |
| 1.3 | feedbackClassMap triplicate | MEDIUM | Low | 1 |
| 1.4 | Date formatting duplication | CRITICAL | Low | 2 |
| 1.5 | Month math duplication | HIGH | Low | 2 |
| 1.6 | Time sort duplication | LOW | Trivial | 2 |
| 1.7 | Birthday validation duplication | HIGH | Medium | 2 |
| 2.1 | AdminMembersManager decomposition | HIGH | Medium-High | 3 |
| 2.2 | BookingForm decomposition | MEDIUM | Medium | 3 |
| 2.3 | FeedbackAlert extraction | MEDIUM | Low | 3 |
| 3.1 | File naming singular/plural | LOW | Low | 5 |
| 3.2 | Type naming consistency | TRIVIAL | Trivial | 5 |
| 4.1 | lib/ subdirectories | MEDIUM | Moderate | 4 |
| 4.2 | home/components/ subdirectories | LOW | Low | 4 |
| 4.3 | hero/ → ui/ move TimePill | TRIVIAL | Trivial | 4 |
| 4.4 | forms/ subdirectories | LOW | Low | 4 |
| 5.1 | home-page-helpers decomposition | HIGH | Medium | 6 |
