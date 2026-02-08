import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('resend', () => {
  class ResendMock {
    emails = {
      send: mockSend,
    };
  }

  return {
    Resend: ResendMock,
  };
});

describe('Resend Client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 're_test_123';
    process.env.RESEND_FROM = 'GYLounge <onboarding@resend.dev>';
    delete process.env.BOOKING_NOTIFICATION_EMAILS;
  });

  it('sendBookingConfirmation should send email with expected content', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email_123' } });

    const { sendBookingConfirmation } = await import('@/lib/resend');
    const result = await sendBookingConfirmation(
      'member@example.com',
      'Alex',
      'Wellness Night',
      '2026-02-10',
      '7:00 PM',
      'Downtown Studio'
    );

    expect(result).toEqual({ ok: true, id: 'email_123' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'GYLounge <onboarding@resend.dev>',
        to: 'member@example.com',
        subject: 'Booking Confirmation',
      })
    );
  });

  it('sendBookingNotification should fail when recipients not set', async () => {
    const { sendBookingNotification } = await import('@/lib/resend');
    const result = await sendBookingNotification(
      'Alex',
      'member@example.com',
      null,
      'Wellness Night',
      '2026-02-10',
      '7:00 PM',
      'Downtown Studio'
    );

    expect(result.ok).toBe(false);
  });

  it('sendBookingNotification should send to configured recipients', async () => {
    process.env.BOOKING_NOTIFICATION_EMAILS = 'owner@example.com, team@example.com';
    mockSend.mockResolvedValue({ data: { id: 'email_456' } });

    const { sendBookingNotification } = await import('@/lib/resend');
    const result = await sendBookingNotification(
      'Alex',
      'member@example.com',
      '555-222-1234',
      'Wellness Night',
      '2026-02-10',
      '7:00 PM',
      'Downtown Studio'
    );

    expect(result).toEqual({ ok: true, id: 'email_456' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['owner@example.com', 'team@example.com'],
        subject: 'New Booking Received',
      })
    );
  });

  it('sendWelcomeEmail should send email with expected subject', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email_789' } });

    const { sendWelcomeEmail } = await import('@/lib/resend');
    const result = await sendWelcomeEmail('member@example.com', 'Alex');

    expect(result).toEqual({ ok: true, id: 'email_789' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'member@example.com',
        subject: 'Welcome to GYLounge',
      })
    );
  });

  it('returns error when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;

    const { sendWelcomeEmail } = await import('@/lib/resend');
    const result = await sendWelcomeEmail('member@example.com', 'Alex');

    expect(result.ok).toBe(false);
  });
});
