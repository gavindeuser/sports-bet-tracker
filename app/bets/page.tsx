import Link from "next/link";

import { BetFiltersForm } from "@/components/bets/bet-filters";
import { BetsTable } from "@/components/bets/bets-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getBets, getFilterOptions } from "@/lib/data/bets";
import { parseBetFilters } from "@/lib/utils/query";

type BetsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BetsPage({ searchParams }: BetsPageProps) {
  const filters = parseBetFilters(await searchParams);
  const [bets, options] = await Promise.all([getBets(filters), getFilterOptions()]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Bets</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Track, filter, and manage every wager.</h2>
        </div>
        <Link href="/bets/new" className="rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">
          Add Bet
        </Link>
      </section>

      <BetFiltersForm filters={filters} sports={options.sports} betTypes={options.betTypes} results={options.results} />

      {bets.length === 0 ? (
        <EmptyState
          title="No bets match these filters"
          description="Try clearing a filter or add a new wager to start building your history."
          actionHref="/bets/new"
          actionLabel="Add Bet"
        />
      ) : (
        <BetsTable bets={bets} />
      )}
    </div>
  );
}
