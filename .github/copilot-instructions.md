# GYLounge Website - Copilot Instructions

## Project Overview
GYLounge is a Ghanaian community platform helping elderly people connect through local events and activities. Built with Next.js 16, React 19, and Tailwind CSS v4, deployed on Vercel.

## Core Features
- **Booking System**: Location-based event booking with date/time slots
- **Membership**: Stripe Checkout payments (no accounts required)
- **Member Verification**: Email-based lookup - no passwords or logins
- **Email Notifications**: Confirmation emails via Resend to booker and organizer

## Tech Stack
- **Next.js 16.1.4** - App Router (no Pages Router)
- **React 19** - Server Components by default
- **Tailwind CSS v4** - `@import "tailwindcss"` syntax (not v3's `@tailwind`)
- **TypeScript 5** - strict mode
- **Supabase** - PostgreSQL database (no Auth features used)
- **Stripe** - Checkout for membership payments
- **Resend** - Transactional emails
- **Vercel** - deployment platform

## Project Structure
```
app/
  page.tsx                # Landing page
  events/
    page.tsx              # Event listings by location
    [eventId]/
      page.tsx            # Event detail + booking form
  booking/
    confirm/page.tsx      # Booking confirmation
  membership/
    page.tsx              # Membership signup (redirects to Stripe)
    success/page.tsx      # Post-payment success
  my-bookings/
    page.tsx              # Email lookup for booking history
  api/
    webhooks/
      stripe/route.ts     # Stripe webhook handler
components/
  ui/                     # Base UI primitives (Button, Input, Card)
  forms/                  # BookingForm, MembershipForm
  events/                 # EventCard, EventList, LocationPicker
utils/
  date.ts                 # Date formatting helpers
  validation.ts           # Form validation (email, phone)
lib/
  supabase.ts             # Supabase client
  stripe.ts               # Stripe client
  resend.ts               # Email client
types/
  database.ts             # Supabase generated types
  booking.ts              # Booking-related types
```

## Architecture Patterns

### No-Auth Design (Email-Based Membership)
Users are identified by email only - no accounts, passwords, or sessions:
```tsx
// Check membership by email lookup
const { data: member } = await supabase
  .from('members')
  .select('id, email, status')
  .eq('email', email)
  .single();

if (member?.status === 'active') {
  // Create booking
} else {
  // Redirect to Stripe Checkout for membership
}
```

### App Router Conventions
- `page.tsx` = route (Server Component by default)
- `layout.tsx` = shared wrapper
- `loading.tsx` = loading UI
- `error.tsx` = error boundary
- Add `'use client'` only for forms and interactivity

### Path Aliases
```tsx
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/date";
import { supabase } from "@/lib/supabase";
```

### Server Actions for Forms
```tsx
// app/actions/booking.ts
'use server'
export async function createBooking(formData: FormData) {
  const email = formData.get('email') as string;
  // 1. Verify membership by email
  // 2. Check slot availability
  // 3. Create booking in Supabase
  // 4. Send confirmation emails via Resend
}
```

### Stripe Webhook for Membership
```tsx
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  // On checkout.session.completed:
  // 1. Extract customer email from session
  // 2. Insert/update member in Supabase
  // 3. Send welcome email
}
```

## Data Flow: Booking System
1. User selects location → fetch events for that location
2. User selects event → fetch available time slots
3. User submits booking form (name, email, phone, slot)
4. Server Action: query `members` table by email
5. If active member → create booking → send confirmations
6. If not member → redirect to `/membership` → Stripe Checkout
7. Stripe webhook → add to `members` table → redirect to booking

## Database Schema (Supabase PostgreSQL)
```sql
-- Members (populated via Stripe webhook)
members: id, email, name, phone, stripe_customer_id, status, created_at

-- Locations
locations: id, name, address, region, created_at

-- Events (linked to location)
events: id, location_id, title, description, date, capacity, created_at

-- Time Slots (linked to event)
slots: id, event_id, start_time, end_time, available_spots

-- Bookings (linked to member, event, slot)
bookings: id, member_id, event_id, slot_id, status, created_at
```

## Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
```

## Styling
- **Tailwind v4**: Theme in `@theme inline` block in `globals.css`
- Dark mode via `prefers-color-scheme` (system preference)
- Use `dark:` variant: `className="bg-white dark:bg-zinc-900"`
- Accessible design for elderly users: larger text, high contrast, clear CTAs

## Key Commands
```bash
npm run dev    # Dev server at localhost:3000
npm run build  # Production build
npm run lint   # ESLint check
```

## Conventions
- Components: PascalCase (`BookingForm.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`Booking`, `Member`)
- Use `next/image` for all images
- Server Components by default; `'use client'` only when needed
- Validate all form inputs server-side (never trust client)
