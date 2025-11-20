// src/components/Loading.tsx
"use client";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-pink-300 animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute inset-2 rounded-full border-4 border-purple-200 border-t-white animate-spin animation-delay-150"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
