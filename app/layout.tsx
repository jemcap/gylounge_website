import type { Metadata } from "next";
import { Roboto, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "GYLounge",
  description:
    "At Golden Years Lounge, connection, comfort, and meaningful engagement are at the heart of everything we do. As a member, you'll enjoy a thoughtfully curated environment designed to support social interaction, inspire new interests, and nurture personal wellbeing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${roboto.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
