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
  layout?: "card" | "full";
  redirectTarget?: "home" | "register";
};

const feedbackClassMap: Record<MembershipFeedback["tone"], string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};

export function MembershipForm({
  action = "#",
  feedback,
  layout = "card",
  redirectTarget = "home",
}: MembershipFormProps) {
  const content = (
    <>
      {feedback ? (
        <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}>
          {feedback.message}
        </p>
      ) : null}

      <form action={action} className="space-y-4">
        {redirectTarget === "register" ? (
          <input type="hidden" name="redirectTarget" value="register" />
        ) : null}
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
    </>
  );

  if (layout === "full") {
    return (
      <section className="flex h-full w-full flex-col justify-center px-6 py-10 md:px-12">
        <h1 className="text-3xl font-semibold text-[#261B07] md:text-4xl">
          Membership Signup
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#3b3127] md:text-lg">
          Complete your registration to receive bank transfer details and a membership reference.
        </p>
        <div className="mt-8 w-full max-w-2xl">{content}</div>
      </section>
    );
  }

  return (
    <Card
      title="Membership Signup"
      description="Boilerplate membership form. Connect this to pending-member creation and email instructions."
    >
      {content}
    </Card>
  );
}
