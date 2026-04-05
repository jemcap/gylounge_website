"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  const classes = [
    "fixed inset-0 z-50 bg-[#0E0B0A]/55 backdrop-blur-[2px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <DialogPrimitive.Overlay ref={ref} className={classes} {...props} />;
});

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function DialogContent({ className, ...props }, ref) {
  const classes = [
    "fixed bottom-0 left-0 right-0 z-50 rounded-t-[2rem] border border-[#dcccb8] bg-[#EBBF6C] p-6 shadow-[0_-20px_60px_rgba(14,11,10,0.28)] outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-[42rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={classes} {...props} />
    </DialogPortal>
  );
});

export const DialogSideContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function DialogSideContent({ className, ...props }, ref) {
  const classes = [
    "fixed right-0 top-0 z-100 text-[#261B07] flex h-screen w-full max-w-[38rem] flex-col overflow-hidden bg-white px-5 pb-6 pt-24 text-[#f5f1ea] shadow-2xl outline-none data-[state=open]:animate-[adminDrawerIn_300ms_ease-in-out] data-[state=closed]:animate-[adminDrawerOut_300ms_ease-in-out]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogPortal>
      <DialogOverlay className="z-99 bg-[#14110b]/30 backdrop-blur-none data-[state=open]:animate-[adminOverlayIn_300ms_ease-in-out] data-[state=closed]:animate-[adminOverlayOut_300ms_ease-in-out]" />
      <DialogPrimitive.Content ref={ref} className={classes} {...props} />
    </DialogPortal>
  );
});

export const DialogHeader = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => {
  const classes = ["space-y-3", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
};

export const DialogFooter = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => {
  const classes = ["mt-6 flex flex-col gap-3 sm:items-end", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
};

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  const classes = [
    "font-roboto text-[2rem] font-bold leading-tight text-[#261B07] sm:text-3xl",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <DialogPrimitive.Title ref={ref} className={classes} {...props} />;
});

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  const classes = ["text-sm font-medium leading-6 text-[#4D3C2C] sm:text-lg", className]
    .filter(Boolean)
    .join(" ");

  return <DialogPrimitive.Description ref={ref} className={classes} {...props} />;
});
