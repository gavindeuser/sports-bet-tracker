"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetPeriodButton() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  async function handleReset() {
    const confirmed = window.confirm("Reset the current period profit/loss from right now?");
    if (!confirmed) {
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch("/api/dashboard/current-period", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to reset current period");
      }
      router.refresh();
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isResetting}
      className="mt-3 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
    >
      {isResetting ? "Resetting..." : "Reset"}
    </button>
  );
}
