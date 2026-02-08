# Bank Transfer Payments (One-Time Membership)

This project can run without any payment gateway by using manual Ghana bank transfers for the one-time membership fee.

The simplest safe flow is:

1. Collect member details (name, email, phone)
2. Create a `members` row with `status = 'pending'` and a unique `bank_transfer_reference`
3. Show and email bank transfer instructions including the reference to include in the transfer narration
4. Admin verifies the transfer (by matching the reference) and sets `status = 'active'`

## Why This Works

- No gateway onboarding required
- No webhook reliability/signature concerns
- Works “strictly in Ghana” as long as members can transfer locally

Tradeoffs:

- Manual operations and delays before activation
- Harder to prevent fraud if references are reused or omitted
- More support requests (people forget the reference)

## Environment Variables

Add to `.env.local` (and to Vercel env vars in production):

```bash
MEMBERSHIP_FEE_GHS=100
BANK_TRANSFER_ACCOUNT_NAME="GYLounge"
BANK_TRANSFER_ACCOUNT_NUMBER="0123456789"
BANK_TRANSFER_BANK_NAME="Your Bank Name"
BANK_TRANSFER_INSTRUCTIONS="Use your membership reference in the transfer narration."
```

## Reference Format

Use a short, copyable reference that is:

- Unique
- Safe to show publicly
- Easy to search in a bank statement

Example format:

`GYL-MEM-<6-8 chars>`

## Membership States

Recommended:

- `pending`: member has instructions/reference but not verified
- `active`: payment verified and member can book
- `inactive` / `cancelled`: admin-controlled

The booking flow should only allow bookings for `active` members.

## Activation (Admin)

Minimal approach:

- Admin checks the bank statement for the reference
- Admin updates the member row in Supabase to `status = 'active'`

Optional automation later:

- An internal admin page protected by an admin password/allowlist
- Bank statement import + reference matching

