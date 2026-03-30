import { Card } from "@/components/ui/card";
import type { BetFilters } from "@/lib/utils/query";

type BetFiltersProps = {
  filters: BetFilters;
  sports: string[];
  betTypes: string[];
  results: string[];
};

export function BetFiltersForm({ filters, sports, betTypes, results }: BetFiltersProps) {
  const visibleResults = results.filter((result) => result !== "VOID");
  const visibleBetTypes = betTypes.filter((betType) => betType !== "Same Game Parlay");

  return (
    <Card>
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Date</span>
          <input
            type="date"
            name="startDate"
            defaultValue={filters.startDate}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Sport</span>
          <select name="sport" defaultValue={filters.sport} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">All sports</option>
            {sports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Result</span>
          <select name="result" defaultValue={filters.result} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">All results</option>
            {visibleResults.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Bet Type</span>
          <select name="betType" defaultValue={filters.betType} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">All types</option>
            {visibleBetTypes.map((betType) => (
              <option key={betType} value={betType}>
                {betType}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Sort</span>
          <select name="sort" defaultValue={filters.sort} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
            Apply Filters
          </button>
          <a href="/bets" className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Reset
          </a>
        </div>
      </form>
    </Card>
  );
}
