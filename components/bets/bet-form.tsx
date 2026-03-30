"use client";

import { BetResult } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { calculatePayoutFromOdds, roundToCents } from "@/lib/calculations/betting";

type BetFormValues = {
  id?: string;
  datePlaced: string;
  sport: string;
  league: string;
  event: string;
  betType: string;
  selection: string;
  americanOdds: number | "";
  stake: number | "";
  result: BetResult;
  payout: number;
  isLive: boolean;
  isParlay: boolean;
  legs: number;
  notes: string;
};

type BetFormInitialValues = {
  id?: string;
  datePlaced?: string | Date;
  dateSettled?: string | Date | null;
  sport?: string;
  league?: string;
  event?: string;
  betType?: string;
  selection?: string;
  americanOdds?: number;
  stake?: number;
  result?: BetResult;
  payout?: number;
  isLive?: boolean;
  isParlay?: boolean;
  legs?: number;
  notes?: string | null;
};

type BetFormProps = {
  mode: "create" | "edit";
  initialValues?: BetFormInitialValues;
  sports: string[];
};

function toDateInput(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

export function BetForm({ mode, initialValues, sports }: BetFormProps) {
  const router = useRouter();
  const resultOptions = Object.values(BetResult).filter((result) => result !== BetResult.VOID);
  const [form, setForm] = useState<BetFormValues>({
    id: initialValues?.id,
    datePlaced: toDateInput(initialValues?.datePlaced) || new Date().toISOString().slice(0, 10),
    sport: initialValues?.sport || "",
    league: initialValues?.league || "",
    event: initialValues?.event || "",
    betType: initialValues?.betType || (initialValues?.isParlay ? "Parlay" : ""),
    selection: initialValues?.selection || "",
    americanOdds: initialValues?.americanOdds ?? "",
    stake: initialValues?.stake || 50,
    result: initialValues?.result || ("" as BetResult),
    payout: initialValues?.payout || 95.45,
    isLive: false,
    isParlay: initialValues?.isParlay || false,
    legs: initialValues?.legs || 1,
    notes: initialValues?.notes || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const numericStake = typeof form.stake === "number" ? form.stake : Number.NaN;
  const numericOdds = typeof form.americanOdds === "number" ? form.americanOdds : Number.NaN;

  useEffect(() => {
    setForm((current) => {
      let payout = current.payout;

      if (current.result === BetResult.LOSS) {
        payout = 0;
      } else if (current.result === BetResult.PUSH || current.result === BetResult.VOID) {
        payout = Number.isFinite(numericStake) ? numericStake : 0;
      } else {
        payout = calculatePayoutFromOdds(numericStake, numericOdds);
      }

      return payout === current.payout ? current : { ...current, payout };
    });
  }, [form.stake, form.americanOdds, form.result, numericStake, numericOdds]);

  const profitPreview =
    Number.isFinite(numericStake) && Number.isFinite(form.payout) ? roundToCents(form.payout - numericStake) : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(mode === "create" ? "/api/bets" : `/api/bets/${form.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          league: form.sport,
          event: form.selection,
          payout: Number(form.payout),
          stake: Number(form.stake),
          americanOdds: Number(form.americanOdds),
          legs: Number(form.legs),
          dateSettled: form.datePlaced,
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Unable to save bet");
      }

      router.push("/bets");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save bet");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<Key extends keyof BetFormValues>(key: Key, value: BetFormValues[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "isParlay" && value === false ? { legs: 1 } : {}),
      ...(key === "isParlay" && value === true && current.legs <= 1 ? { legs: 2 } : {}),
      ...(key === "betType" && value === "Straight" ? { isParlay: false, legs: 1 } : {}),
      ...(key === "betType" && value === "Parlay" ? { isParlay: true, legs: current.legs > 1 ? current.legs : 2 } : {}),
      ...(key === "result" && (value === BetResult.PUSH || value === BetResult.VOID) ? { payout: typeof current.stake === "number" ? current.stake : 0 } : {}),
      ...(key === "result" && value === BetResult.LOSS ? { payout: 0 } : {}),
      ...(key === "stake" &&
      value !== "" &&
      (current.result === BetResult.PUSH || current.result === BetResult.VOID)
        ? { payout: Number(value) }
        : {}),
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Date">
          <input type="date" value={form.datePlaced} onChange={(event) => updateField("datePlaced", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3" />
        </Field>
        <Field label="Sport">
          <select value={form.sport} onChange={(event) => updateField("sport", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
            <option value="">Select a sport</option>
            {sports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Bet Type">
          <select value={form.betType} onChange={(event) => updateField("betType", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
            <option value="">Select a bet type</option>
            <option value="Straight">Straight</option>
            <option value="Parlay">Parlay</option>
          </select>
        </Field>
        <Field label="Selection">
          <input value={form.selection} onChange={(event) => updateField("selection", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3" />
        </Field>
        <Field label="Odds">
          <input
            type="number"
            value={form.americanOdds}
            onChange={(event) => updateField("americanOdds", event.target.value === "" ? "" : Number(event.target.value))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
          />
        </Field>
        <Field label="Stake">
          <input
            type="number"
            step="0.01"
            value={form.stake}
            onChange={(event) => updateField("stake", event.target.value === "" ? "" : Number(event.target.value))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
          />
        </Field>
        <Field label="Result">
          <select value={form.result} onChange={(event) => updateField("result", event.target.value as BetResult)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
            <option value="">Select a result</option>
            {resultOptions.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payout">
          <input
            type="number"
            step="0.01"
            value={form.payout}
            readOnly
            className="w-full rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-slate-700"
          />
          <p className="mt-2 text-xs text-slate-500">Profit: ${profitPreview.toFixed(2)}</p>
        </Field>
      </div>

      {errorMessage ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSaving} className="rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">
          {isSaving ? "Saving..." : mode === "create" ? "Create Bet" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/bets")} className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
          Cancel
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
