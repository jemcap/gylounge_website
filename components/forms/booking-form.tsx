import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type BookingFormProps = {
  eventId: string;
  slotId?: string;
};

export function BookingForm({ eventId, slotId }: BookingFormProps) {
  return (
    <Card
      title="Booking Form"
      description="Boilerplate booking form. Wire this to the booking server action in the next milestone."
    >
      <form action="#" className="space-y-4">
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
