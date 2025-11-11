import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-6 py-3 rounded-lg font-nunito font-bold transition-all disabled:opacity-50 border-3 retro-shadow-hover uppercase tracking-wide text-sm";

  const variants = {
    primary: "bg-amber-600 text-cream border-amber-800 hover:bg-amber-700",
    secondary: "bg-teal-600 text-white border-teal-800 hover:bg-teal-700",
    danger: "bg-red-700 text-white border-red-900 hover:bg-red-800",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
