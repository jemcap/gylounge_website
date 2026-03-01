import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type MembershipFeedback = {
  tone: "success" | "error" | "info";
  message: string;
};

export type MembershipFormProps = {
  action?: FormAction;
  feedback?: MembershipFeedback;
};

const feedbackClassMap: Record<MembershipFeedback["tone"], string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};

export function MembershipForm({ action = "#", feedback }: MembershipFormProps) {
  return (
    <Card
      title="Membership Signup"
      description="Boilerplate membership form. Connect this to pending-member creation and email instructions."
    >
      {feedback ? (
        <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}>
          {feedback.message}
        </p>
      ) : null}

      <form action={action} className="space-y-4">
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
