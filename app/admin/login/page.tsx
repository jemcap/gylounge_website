import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-md">
        <Card
          title="Admin login"
          description="Boilerplate for Supabase Auth magic-link sign-in."
        >
          <form action="#" className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-[#1c1b18]">
                Admin email
              </label>
              <Input id="admin-email" type="email" name="email" placeholder="admin@gylounge.com" required />
            </div>
            <Button type="submit" className="w-full">
              Send magic link
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
