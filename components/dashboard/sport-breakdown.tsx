import { Card } from "@/components/ui/card";
import type { SportBreakdown as SportBreakdownItem } from "@/lib/calculations/analytics";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

type SportBreakdownProps = {
  items: SportBreakdownItem[];
};

export function SportBreakdown({ items }: SportBreakdownProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Sport Breakdown</h2>
          <p className="text-sm text-slate-500">Performance grouped by sport.</p>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3 pr-6 font-medium">Sport</th>
              <th className="pb-3 pr-8 font-medium">Bets</th>
              <th className="pb-3 pr-6 font-medium">Staked</th>
              <th className="pb-3 pr-6 font-medium">Net</th>
              <th className="pb-3 font-medium">ROI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.sport} className="border-t border-white/60">
                <td className="py-3 pr-6 font-medium text-slate-900">{item.sport}</td>
                <td className="py-3 pr-8 text-slate-700">{item.totalBets}</td>
                <td className="py-3 pr-6 text-slate-700">{formatCurrency(item.totalStaked)}</td>
                <td className={`py-3 pr-6 font-medium ${item.totalProfit >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"}`}>
                  {formatCurrency(item.totalProfit)}
                </td>
                <td className="py-3 text-slate-700">{formatPercent(item.roi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
