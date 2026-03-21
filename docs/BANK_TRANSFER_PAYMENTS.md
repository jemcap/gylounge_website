# Bank Transfer Payments (Membership Activation Model)

## Purpose
This document defines the bank-transfer membership system used by GYLounge and how it connects to the product flows in `docs/PROJECT_OVERVIEW.md`.

## Policy
- No payment gateway integration.
- Membership activation is manual.
- Booking is allowed only for active members.

## End-to-End Process
1. User submits membership details (name, email, phone).
2. Server creates `members` row with:
   - `status = 'pending'`
   - the submitted profile details required by the current membership schema
3. Server writes a row in a dedicated reference table (for example `payment_references`) and links it to the member.
4. App shows bank transfer instructions and emails the same details, including the generated reference string for narration.
5. User completes transfer and includes the emailed reference in narration.
6. Admin verifies transfer and sets member to `active`.
7. Member can now complete bookings.

## Environment Contract
Set in `.env.local` and production:

```bash
MEMBERSHIP_FEE_GHS=100
BANK_TRANSFER_ACCOUNT_NAME="GYLounge"
BANK_TRANSFER_ACCOUNT_NUMBER="0123456789"
BANK_TRANSFER_BANK_NAME="Your Bank Name"
BANK_TRANSFER_INSTRUCTIONS="Use your membership reference in the transfer narration."
```

## Reference Requirements
Reference format must be:
- Unique per membership intent
- Short and copyable
- Easy to match in bank statements
- Persisted in a dedicated reference table rather than directly on `members` or `bookings`

Current helper behavior in `lib/membership.ts`:
- `generateBankTransferReference()` returns `GYL-MEM-<8 hex chars>`.

## Membership State Machine
- `pending`: instructions issued, transfer not yet verified
- `active`: transfer verified, booking allowed

Status vocabulary for this scope is intentionally limited to `pending` and `active`.

## Admin Verification Workflow
Primary path:
- Admin signs in to `/admin/*`.
- Admin opens member management (`/admin/members`).
- Admin reconciles the transfer using the emailed reference plus the member's name/email details.
- Admin updates member status to `active` after verification.

Operational rules:
- Never activate without a verified matching reference.
- Keep a note/audit trail of activation decisions.
- Escalate mismatches (missing/incorrect reference) for manual review.

## Failure and Support Scenarios
- Missing reference in transfer narration:
  - Keep member `pending`.
  - Request transfer proof and reconcile manually.

- Duplicate or ambiguous reference:
  - Do not auto-activate.
  - Require human review and documentation.

- Delayed transfer confirmation:
  - Keep status `pending` and communicate verification SLA.

## Security and Data Handling
- Bank details are configuration, not hardcoded.
- Service role writes must happen server-side only.
- Public booking flows must validate `members.status` each time.

## Acceptance Criteria
- Membership submission creates a pending member record and issues a generated payment reference in the instructions email.
- Membership submission persists the generated reference in a dedicated reference table linked to the member.
- User receives identical instructions on screen and by email.
- Admin can activate member using the emailed reference plus the member record.
- Booking path rejects non-active members.
