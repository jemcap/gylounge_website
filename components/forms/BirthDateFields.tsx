import type { UseFormRegister } from "react-hook-form";
import type { MembershipFormValues } from "@/lib/membership-form";
import {
  errorFieldClass,
  errorMessageClass,
  labelClass,
  selectClass,
} from "@/components/forms/membership-form-styles";

const days = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export type BirthDateFieldsProps = {
  register: UseFormRegister<MembershipFormValues>;
  errorMessage?: string;
  hasDayError: boolean;
  hasMonthError: boolean;
  hasYearError: boolean;
};

export function BirthDateFields({
  register,
  errorMessage,
  hasDayError,
  hasMonthError,
  hasYearError,
}: BirthDateFieldsProps) {
  return (
    <div>
      <span className={labelClass}>
        Birthday <span className="text-red-600">*</span>
      </span>
      <div className="grid grid-cols-3">
        <select
          className={`${selectClass} ${hasDayError ? errorFieldClass : ""}`}
          aria-label="Day"
          aria-invalid={Boolean(errorMessage)}
          {...register("birthDay")}
        >
          <option value="" disabled>
            DD
          </option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <select
          className={`${selectClass} ${hasMonthError ? errorFieldClass : ""}`}
          aria-label="Month"
          aria-invalid={Boolean(errorMessage)}
          {...register("birthMonth")}
        >
          <option value="" disabled>
            MM
          </option>
          {months.map((month, index) => (
            <option key={month} value={month}>
              {monthLabels[index]}
            </option>
          ))}
        </select>
        <select
          className={`${selectClass} ${hasYearError ? errorFieldClass : ""}`}
          aria-label="Year"
          aria-invalid={Boolean(errorMessage)}
          {...register("birthYear")}
        >
          <option value="" disabled>
            YYYY
          </option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {errorMessage ? <p className={errorMessageClass}>{errorMessage}</p> : null}
    </div>
  );
}
