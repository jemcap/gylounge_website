import { Card } from "@/components/ui/card";

export default function AdminBookingsPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-5xl">
        <Card
          title="Admin bookings"
          description="Boilerplate for booking oversight, status updates, and operational support."
        >
          <p className="text-sm text-[#3b3127]">Add bookings table and management actions in milestone 5.</p>
        </Card>
      </div>
    </main>
  );
}
