export type LocationOption = {
  id: string;
  name: string;
};

export type LocationPickerProps = {
  options: LocationOption[];
  value?: string;
  name?: string;
  label?: string;
};

export function LocationPicker({
  options,
  value,
  name = "locationId",
  label = "Location",
}: LocationPickerProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#1c1b18]">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="w-full rounded-xl border border-[#d9cfbf] bg-white px-4 py-3 text-sm text-[#1c1b18] outline-none transition focus:border-[#8b6b3f]"
      >
        <option value="">All locations</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
