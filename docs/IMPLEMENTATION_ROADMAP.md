# GYLounge Implementation Roadmap

## Phase 1: Project Setup

### 1.1 Install Dependencies
```bash
npm install @supabase/supabase-js resend
npm install -D supabase
```

### 1.2 Create Folder Structure
```
mkdir -p components/{ui,forms,events}
mkdir -p utils lib types
mkdir -p app/{events,booking,membership,my-bookings}
```

### 1.3 Environment Variables
Create `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Membership (bank transfer)
MEMBERSHIP_FEE_GHS=100
BANK_TRANSFER_ACCOUNT_NAME="GYLounge"
BANK_TRANSFER_ACCOUNT_NUMBER="0123456789"
BANK_TRANSFER_BANK_NAME="Your Bank Name"
BANK_TRANSFER_INSTRUCTIONS="Use your membership reference in the transfer narration."

# Resend
RESEND_API_KEY=re_...
```

Add to `.gitignore`:
```
.env.local
```

---

## Phase 2: Database Setup (Supabase)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy the project URL and anon key to `.env.local`
3. Copy the service role key (Settings → API) to `.env.local`

### 2.2 Create Database Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Members table (created as pending, activated after manual verification)
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  bank_transfer_reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  capacity INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time slots table
CREATE TABLE slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_spots INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_events_location ON events(location_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_bookings_member ON bookings(member_id);
CREATE INDEX idx_slots_event ON slots(event_id);
```

### 2.3 Generate TypeScript Types
```bash
npx supabase gen types typescript --project-id your_project_id > app/types/database.ts
```

---

## Phase 3: Core Library Setup

### 3.1 Supabase Client (`lib/supabase.ts`)
- Create browser client for client components
- Create server client for Server Actions/API routes

### 3.2 Membership Helpers (`lib/membership.ts`)
- Generate a unique bank transfer reference
- Create a pending member record
- Send membership instructions email (Resend)

### 3.3 Resend Client (`lib/resend.ts`)
- Initialize Resend client
- Email templates for booking confirmation
- Email templates for welcome/membership

---

## Phase 4: Build Core Features

### 4.1 Landing Page (`app/page.tsx`)
- Hero section explaining GYLounge
- Featured locations
- CTA to browse events

### 4.2 Events Listing (`app/events/page.tsx`)
- Location picker/filter
- List of upcoming events
- Event cards with date, title, location

### 4.3 Event Detail (`app/events/[eventId]/page.tsx`)
- Event information
- Available time slots
- Booking form (name, email, phone, slot selection)

### 4.4 Booking Flow
- Server Action to process booking
- Membership check by email
- Redirect to membership instructions if not a member
- Create booking and send confirmations

### 4.5 Membership Page (`app/membership/page.tsx`)
- Membership benefits
- Bank transfer instructions (one-time membership fee)
- Show a unique reference for the user to include in the transfer

### 4.6 Manual Activation Process (Admin)
- Admin checks bank statement for the reference
- Admin sets member `status = 'active'` in Supabase
- Optional: trigger a welcome email after activation

### 4.7 My Bookings (`app/my-bookings/page.tsx`)
- Email input form
- Display bookings for that email
- Option: Magic link for security

---

## Phase 5: UI Components

### Base Components (`components/ui/`)
- Button (primary, secondary, outline variants)
- Input (text, email, phone)
- Card (for events, bookings)
- Select (for location picker, time slots)
- Loading spinner

### Form Components (`components/forms/`)
- BookingForm
- EmailLookupForm (for my-bookings)

### Event Components (`components/events/`)
- EventCard
- EventList
- LocationPicker
- SlotPicker

---

## Phase 6: Bank Transfer Setup

### 6.1 Confirm Bank Details
1. Collect the Ghana bank account details the organization wants to receive membership fees into
2. Confirm the exact narration/reference format members must include (short, copyable)

### 6.2 Decide Verification Workflow
1. Decide verification SLA (e.g., “within 24 hours”)
2. Decide who verifies transfers (admin/organizer)
3. Decide where activation happens first (Supabase dashboard is simplest)

### 6.3 Member Communication
1. Ensure membership instructions appear on `/membership`
2. Email the same instructions to the member (Resend) including the reference

---

## Phase 7: Email Setup (Resend)

### 7.1 Create Resend Account
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain initially)
3. Get API key from Dashboard

### 7.2 Email Templates to Create
- Booking confirmation (to member)
- Booking notification (to organizer)
- Welcome email (after membership purchase)

---

## Phase 8: Deployment (Vercel)

### 8.1 Connect Repository
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard

### 8.3 Verify Supabase Connection
- Ensure Supabase allows connections from Vercel IPs
- Test booking flow end-to-end

---

## Phase 9: Testing Checklist

- [ ] Can browse events by location
- [ ] Can view event details and available slots
- [ ] Booking form validates inputs
- [ ] Non-member sees bank transfer instructions + reference
- [ ] Pending member cannot book
- [ ] Activating member enables booking
- [ ] Member can complete booking
- [ ] Confirmation emails are sent
- [ ] My Bookings shows correct bookings by email
- [ ] Works on mobile (elderly-friendly)
- [ ] Accessibility: keyboard navigation, screen readers

---

## Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Generate Supabase types
npx supabase gen types typescript --project-id PROJECT_ID > types/database.ts
```

---

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Resend Next.js Guide](https://resend.com/docs/send-with-nextjs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
