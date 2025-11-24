// src/components/ToastContainer.tsx
"use client";

import { useEffect, useState } from "react";
import { Toast, registerGlobalToastListener } from "@/hooks/useToast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    registerGlobalToastListener((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in slide-in-from-right duration-300"
        >
          <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-900"
                : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : toast.type === "warning"
                ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
