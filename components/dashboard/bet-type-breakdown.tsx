import { Card } from "@/components/ui/card";
import type { BetTypeBreakdown as BetTypeBreakdownItem } from "@/lib/calculations/analytics";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

type BetTypeBreakdownProps = {
  items: BetTypeBreakdownItem[];
};

export function BetTypeBreakdown({ items }: BetTypeBreakdownProps) {
  return (
    <Card>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Straight vs Parlay</h2>
        <p className="text-sm text-slate-500">A quick read on how your straight bets compare to parlays.</p>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-slate-900">{item.label}</p>
              <p className={`text-sm font-semibold ${item.totalProfit >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"}`}>
                {formatCurrency(item.totalProfit)}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Bets</p>
                <p className="mt-1 font-medium text-slate-800">{item.totalBets}</p>
              </div>
              <div>
                <p className="text-slate-500">Staked</p>
                <p className="mt-1 font-medium text-slate-800">{formatCurrency(item.totalStaked)}</p>
              </div>
              <div>
                <p className="text-slate-500">ROI</p>
                <p className="mt-1 font-medium text-slate-800">{formatPercent(item.roi)}</p>
              </div>
              <div>
                <p className="text-slate-500">Win Rate</p>
                <p className="mt-1 font-medium text-slate-800">{formatPercent(item.winRate)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
