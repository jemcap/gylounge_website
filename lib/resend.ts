import { Resend } from "resend";

type SendResult = { ok: true; id: string } | { ok: false; error: string };

let resendClient: Resend | null = null;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set.");
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendEmail = async (params: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> => {
  try {
    const response = await getResendClient().emails.send({
      from: process.env.RESEND_FROM ?? "GYLounge <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { ok: true, id: response.data?.id ?? "unknown" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    return { ok: false, error: message };
  }
};

export const sendBookingConfirmation = async (
  to: string,
  memberName: string,
  eventTitle: string,
  date: string,
  time: string,
  location: string,
): Promise<SendResult> => {
  const subject = "Booking Confirmation";
  const html = `
    <h1>Booking Confirmation</h1>
    <p>Hi ${memberName},</p>
    <p>Thanks for your booking. We look forward to welcoming you to GYLounge.</p>
    <ul>
      <li><strong>Event:</strong> ${eventTitle}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
      <li><strong>Location:</strong> ${location}</li>
    </ul>
  `;
  const text = [
    "Booking Confirmation",
    `Hi ${memberName},`,
    "Thanks for your booking. We look forward to welcoming you to GYLounge.",
    `Event: ${eventTitle}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Location: ${location}`,
  ].join("\n");
  return sendEmail({ to, subject, html, text });
};

export const sendBookingNotification = async (
  memberName: string,
  memberEmail: string,
  memberPhone: string | null | undefined,
  eventTitle: string,
  date: string,
  time: string,
  location: string,
): Promise<SendResult> => {
  const recipients = (process.env.BOOKING_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    return { ok: false, error: "BOOKING_NOTIFICATION_EMAILS is not set." };
  }
  const subject = "New Booking Received";
  const phoneLine = memberPhone ? `Phone: ${memberPhone}` : "Phone: Not provided";
  const html = `
    <h1>New Booking</h1>
    <ul>
      <li><strong>Member:</strong> ${memberName}</li>
      <li><strong>Email:</strong> ${memberEmail}</li>
      <li><strong>${phoneLine}</strong></li>
      <li><strong>Event:</strong> ${eventTitle}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
      <li><strong>Location:</strong> ${location}</li>
    </ul>
  `;
  const text = [
    "New Booking Received",
    `Member: ${memberName}`,
    `Email: ${memberEmail}`,
    phoneLine,
    `Event: ${eventTitle}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Location: ${location}`,
  ].join("\n");
  return sendEmail({ to: recipients, subject, html, text });
};

export const sendWelcomeEmail = async (
  to: string,
  memberName: string,
): Promise<SendResult> => {
  const subject = "Welcome to GYLounge";
  const html = `
    <h1>Welcome to GYLounge</h1>
    <p>Hi ${memberName},</p>
    <p>Your membership is active. You can start booking experiences right away.</p>
  `;
  const text = [
    "Welcome to GYLounge",
    `Hi ${memberName},`,
    "Your membership is active. You can start booking experiences right away.",
  ].join("\n");
  return sendEmail({ to, subject, html, text });
};

export const sendMembershipInstructions = async (
  to: string,
  memberName: string,
  reference: string,
  details: {
    membershipFeeGhs: number;
    accountName: string;
    accountNumber: string;
    bankName: string;
    instructions: string;
  },
): Promise<SendResult> => {
  const subject = "Your GYLounge membership bank transfer details";
  const html = `
    <h1>GYLounge Membership</h1>
    <p>Hi ${memberName},</p>
    <p>To activate your membership, please make a bank transfer using the details below.</p>
    <ul>
      <li><strong>Amount:</strong> GHS ${details.membershipFeeGhs}</li>
      <li><strong>Bank:</strong> ${details.bankName}</li>
      <li><strong>Account name:</strong> ${details.accountName}</li>
      <li><strong>Account number:</strong> ${details.accountNumber}</li>
      <li><strong>Reference:</strong> ${reference}</li>
    </ul>
    <p><strong>Important:</strong> ${details.instructions}</p>
    <p>Once verified, your membership will be activated and you can book events.</p>
  `;
  const text = [
    "GYLounge Membership",
    `Hi ${memberName},`,
    "To activate your membership, please make a bank transfer using the details below.",
    `Amount: GHS ${details.membershipFeeGhs}`,
    `Bank: ${details.bankName}`,
    `Account name: ${details.accountName}`,
    `Account number: ${details.accountNumber}`,
    `Reference: ${reference}`,
    "",
    `Important: ${details.instructions}`,
    "Once verified, your membership will be activated and you can book events.",
  ].join("\n");
  return sendEmail({ to, subject, html, text });
};
