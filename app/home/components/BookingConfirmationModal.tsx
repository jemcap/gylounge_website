"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  BOOKING_CONFIRMATION_QUERY_KEYS,
  createBookingConfirmationRows,
  type BookingConfirmation,
} from "@/lib/booking-confirmation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BookingConfirmationModalProps = {
  confirmation: BookingConfirmation;
};

export function BookingConfirmationModal({
  confirmation,
}: BookingConfirmationModalProps) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationRows = createBookingConfirmationRows(confirmation);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("booking");
      params.delete("bookingId");
      for (const key of BOOKING_CONFIRMATION_QUERY_KEYS) {
        params.delete(key);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}#booking`, {
        scroll: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto px-5 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Your Visit Has Been Confirmed
          </DialogTitle>
          <DialogDescription>
            Thank you for completing the form and your payment has been
            processed! Our team is reviewing your details, and you&apos;ll
            receive an email from us soon with your booking information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col mt-5 gap-2">
          {confirmationRows.map(({ label, value }) => (
            <div key={label} className=" flex-row flex">
              <p className=" font-bold pr-2">{label}:</p>
              <p className=" text-sm  text-[#261B07] sm:text-base">{value}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full sm:w-auto font-bold text-2xl py-2 border-3 border-[#3F2D17] bg-[#3F2D17] text-[#F1D39B] cursor-pointer">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
