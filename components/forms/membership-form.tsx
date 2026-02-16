import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MembershipForm() {
  return (
    <Card
      title="Membership Signup"
      description="Boilerplate membership form. Connect this to pending-member creation and email instructions."
    >
      <form action="#" className="space-y-4">
        <div>
          <label htmlFor="member-name" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            Full name
          </label>
          <Input id="member-name" name="name" placeholder="Ama Boateng" required />
        </div>
        <div>
          <label htmlFor="member-email" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            Email
          </label>
          <Input id="member-email" type="email" name="email" placeholder="ama@example.com" required />
        </div>
        <div>
          <label htmlFor="member-phone" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            Phone
          </label>
          <Input id="member-phone" name="phone" placeholder="+233 20 000 0000" required />
        </div>
        <Button type="submit">Generate transfer reference</Button>
      </form>
    </Card>
  );
}
