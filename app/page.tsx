import Link from "next/link";

import { ChartCard } from "@/components/charts/chart-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SportBreakdown } from "@/components/dashboard/sport-breakdown";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getBetVolumeSeries,
  getCumulativeProfitSeries,
  getCurrentPeriodProfit,
  getDashboardMetrics,
  getMonthlyProfitSeries,
  getSportBreakdown,
} from "@/lib/calculations/analytics";
import { getAppConfig } from "@/lib/data/app-config";
import { getBets } from "@/lib/data/bets";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [bets, appConfig] = await Promise.all([getBets({ sort: "desc" }), getAppConfig()]);

  if (bets.length === 0) {
    return (
      <EmptyState
        title="No bets tracked yet"
        description="Add your first wager to start building a persistent history and dashboard."
        actionHref="/bets/new"
        actionLabel="Add your first bet"
      />
    );
  }

  const metrics = {
    ...getDashboardMetrics(bets),
    currentPeriodProfit: getCurrentPeriodProfit(bets, appConfig.currentPeriodStart),
  };
  const sportBreakdown = getSportBreakdown(bets);
  const cumulativeProfit = getCumulativeProfitSeries(bets);
  const monthlyProfit = getMonthlyProfitSeries(bets);
  const betVolume = getBetVolumeSeries(bets);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">One place for your betting history and results.</h2>
        </div>
        <Link href="/bets/new" className="rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">
          Add Bet
        </Link>
      </section>

      <SummaryCards metrics={metrics} />

      <div className="grid gap-6 2xl:grid-cols-3">
        <div className="2xl:col-span-2">
          <ChartCard
            title="Profit/Loss Over Time"
            description="Running total based on each bet's computed profit or loss."
            data={cumulativeProfit}
            dataKey="profit"
            xKey="date"
            type="area"
          />
        </div>
        <div className="2xl:col-span-1">
          <SportBreakdown items={sportBreakdown} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Monthly Profit/Loss"
          description="Monthly performance view for a faster trend check."
          data={monthlyProfit}
          dataKey="profit"
          xKey="month"
          type="bar"
          color="#d97706"
        />
        <ChartCard
          title="Bet Volume Over Time"
          description="Daily number of tracked bets over time."
          data={betVolume}
          dataKey="bets"
          xKey="date"
          type="bar"
          color="#2563eb"
          valueFormat="number"
        />
      </div>
    </div>
  );
}
