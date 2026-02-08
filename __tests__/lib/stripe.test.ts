import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Stripe library
const mockCreate = vi.fn();
const mockConstructEvent = vi.fn();

vi.mock('stripe', () => {
  class StripeMock {
    checkout = {
      sessions: {
        create: mockCreate,
      },
    };
    webhooks = {
      constructEvent: mockConstructEvent,
    };
  }

  return {
    default: StripeMock,
  };
});

describe('Stripe Client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
  });

  it('should export a createCheckoutSession function', async () => {
    const { createCheckoutSession } = await import('@/lib/stripe');
    expect(createCheckoutSession).toBeDefined();
    expect(typeof createCheckoutSession).toBe('function');
  });

  it('should export a verifyWebhookSignature function', async () => {
    const { verifyWebhookSignature } = await import('@/lib/stripe');
    expect(verifyWebhookSignature).toBeDefined();
    expect(typeof verifyWebhookSignature).toBe('function');
  });

  it('createCheckoutSession should call stripe with correct params', async () => {
    mockCreate.mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' });

    const { createCheckoutSession } = await import('@/lib/stripe');
    const session = await createCheckoutSession(
      'test@example.com',
      'price_123',
      'http://localhost:3000/membership/success',
      'http://localhost:3000/membership'
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'test@example.com',
        mode: expect.any(String),
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price: 'price_123',
            quantity: 1,
          }),
        ]),
        success_url: 'http://localhost:3000/membership/success',
        cancel_url: 'http://localhost:3000/membership',
        metadata: {
          email: 'test@example.com',
        },
      })
    );
    expect(session).toEqual({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' });
  });

  it('verifyWebhookSignature should call constructEvent with correct params', async () => {
    const mockEvent = { type: 'checkout.session.completed' };
    mockConstructEvent.mockReturnValue(mockEvent);

    const { verifyWebhookSignature } = await import('@/lib/stripe');
    const event = await verifyWebhookSignature(Buffer.from('raw-body'), 'sig-header');

    expect(mockConstructEvent).toHaveBeenCalledWith(
      expect.any(Buffer),
      'sig-header',
      'sk_test_123'
    );
    expect(event).toEqual(mockEvent);
  });
});
