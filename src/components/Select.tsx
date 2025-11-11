import React from "react";

interface SelectProps<T extends string> {
  label?: string;
  error?: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}

export default function Select<T extends string>({
  label,
  error,
  value,
  onChange,
  options,
  className = "",
}: SelectProps<T>) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 font-nunito font-bold text-amber-900">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 border-3 rounded-lg font-nunito focus:outline-none focus:ring-4 focus:ring-amber-300 bg-cream transition-all retro-shadow cursor-pointer ${
          error ? "border-red-600" : "border-amber-800"
        } ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-nunito font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}
