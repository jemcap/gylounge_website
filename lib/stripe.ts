import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

const stripeClient = async () => {
  if (!stripeSecretKey) {
    throw new Error("Stripe Secret Key must be provided");
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
};

export const createCheckoutSession = async (
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) => {
  const stripe = await stripeClient();
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      email,
    },
  });
};

export const verifyWebhookSignature = async (
  payload: Buffer,
  signature: string,
) => {
  const stripe = await stripeClient();
  try {
    return stripe.webhooks.constructEvent(payload, signature, stripeSecretKey);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    throw new Error("Invalid webhook signature");
  }
};

export default stripeClient;
