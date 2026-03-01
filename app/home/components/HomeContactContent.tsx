export function HomeContactContent() {
  return (
    <div className="space-y-3 text-sm text-[#2a2216] md:text-base">
      <p>
        Email:{" "}
        <a
          href="mailto:hello@gylounge.com"
          className="font-medium text-[#3f2d17] underline"
        >
          hello@gylounge.com
        </a>
      </p>
      <p>
        Phone:{" "}
        <a
          href="tel:+233200000000"
          className="font-medium text-[#3f2d17] underline"
        >
          +233 20 000 0000
        </a>
      </p>
      <p>Address: Accra, Ghana</p>
      <p>Hours: Monday to Saturday, 9:00 AM to 6:00 PM GMT</p>
    </div>
  );
}
