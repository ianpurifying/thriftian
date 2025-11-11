import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 font-nunito font-bold text-amber-900">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-3 rounded-lg font-nunito focus:outline-none focus:ring-4 focus:ring-amber-300 bg-cream transition-all retro-shadow ${
          error ? "border-red-600" : "border-amber-800"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 font-nunito font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}
