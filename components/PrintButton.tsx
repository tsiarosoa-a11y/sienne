"use client";

import { useState } from "react";

export function PrintButton() {
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accentStrong transition-colors text-sm font-medium disabled:opacity-50"
      aria-label="Imprimer ou exporter en PDF"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      <span>Imprimer / PDF</span>
    </button>
  );
}
