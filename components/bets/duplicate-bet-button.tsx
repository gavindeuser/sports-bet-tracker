"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DuplicateBetButtonProps = {
  id: string;
};

export function DuplicateBetButton({ id }: DuplicateBetButtonProps) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);

  async function handleDuplicate() {
    setIsDuplicating(true);

    try {
      const response = await fetch(`/api/bets/${id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate bet");
      }

      router.refresh();
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDuplicating ? "Duplicating..." : "Duplicate"}
    </button>
  );
}
