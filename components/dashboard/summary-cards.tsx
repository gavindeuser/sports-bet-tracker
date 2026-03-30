import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatPercent } from "@/lib/utils/format";

type SummaryCardsProps = {
  metrics: {
    totalBets: number;
    totalStaked: number;
    totalPayout: number;
    totalProfit: number;
    roi: number;
    winRate: number;
    averageStake: number;
  };
};

const items = (metrics: SummaryCardsProps["metrics"]) => [
  { label: "Total Bets", value: metrics.totalBets.toString() },
  { label: "Total Staked", value: formatCurrency(metrics.totalStaked) },
  { label: "Total Payout", value: formatCurrency(metrics.totalPayout) },
  {
    label: "Net Profit/Loss",
    value: formatCurrency(metrics.totalProfit),
    accent: metrics.totalProfit >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]",
  },
  { label: "ROI", value: formatPercent(metrics.roi) },
  { label: "Win Rate", value: formatPercent(metrics.winRate) },
  { label: "Average Stake", value: formatCurrency(metrics.averageStake) },
];

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items(metrics).map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className={cn("mt-3 text-3xl font-semibold tracking-tight text-slate-900", item.accent)}>
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
