"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
      />

      <div className="relative bg-cream rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-4 border-amber-900 retro-shadow">
        <div className="flex items-center justify-between p-6 border-b-4 border-amber-800 bg-amber-100">
          <h2 className="text-2xl font-rye text-amber-900 retro-text-shadow">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl hover:text-amber-600 transition-colors font-bold leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
