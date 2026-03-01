import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type BookingFeedback = {
  tone: "success" | "error" | "info";
  message: string;
};

export type BookingFormProps = {
  eventId: string;
  slotId?: string;
  action?: FormAction;
  feedback?: BookingFeedback;
  context?: string;
};

const feedbackClassMap: Record<BookingFeedback["tone"], string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};

export function BookingForm({
  eventId,
  slotId,
  action = "#",
  feedback,
  context,
}: BookingFormProps) {
  return (
    <Card
      title="Booking Form"
      description="Boilerplate booking form. Wire this to the booking server action in the next milestone."
    >
      {context ? <p className="mb-4 rounded-xl bg-[#f4efe5] px-4 py-3 text-sm text-[#3b3127]">{context}</p> : null}
      {feedback ? (
        <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}>
          {feedback.message}
        </p>
      ) : null}

      <form action={action} className="space-y-4">
        <input type="hidden" name="eventId" value={eventId} />
        {slotId ? <input type="hidden" name="slotId" value={slotId} /> : null}
        <div>
          <label htmlFor="booking-name" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            Full name
          </label>
          <Input id="booking-name" name="name" placeholder="Kwame Mensah" required />
        </div>
        <div>
          <label htmlFor="booking-email" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            Email
          </label>
          <Input id="booking-email" type="email" name="email" placeholder="kwame@example.com" required />
        </div>
        <div>
          <label htmlFor="booking-phone" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            Phone (optional)
          </label>
          <Input id="booking-phone" name="phone" placeholder="+233 24 000 0000" />
        </div>
        <Button type="submit">Continue to confirmation</Button>
      </form>
    </Card>
  );
}
