type PolicyListProps = {
  items: string[];
};

export function PolicyList({ items }: PolicyListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="list-disc pl-5 text-sm text-[#261B07] marker:text-[#7A5A1E] md:text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
