import Link from "next/link";
import { Bet, BetResult } from "@prisma/client";

import { DeleteBetButton } from "@/components/bets/delete-bet-button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type BetsTableProps = {
  bets: Bet[];
};

export function BetsTable({ bets }: BetsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/70 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Placed</th>
              <th className="px-5 py-4 font-medium">Sport</th>
              <th className="px-5 py-4 font-medium">Selection</th>
              <th className="px-5 py-4 font-medium">Odds</th>
              <th className="px-5 py-4 font-medium">Stake</th>
              <th className="px-5 py-4 font-medium">Result</th>
              <th className="px-5 py-4 font-medium">P/L</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border-t border-white/60 align-top">
                <td className="px-5 py-4 text-slate-700">
                  <div>{formatDate(bet.datePlaced)}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{bet.sport}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{bet.selection}</div>
                  <div className="text-xs text-slate-500">{bet.betType}</div>
                </td>
                <td className="px-5 py-4 text-slate-700">{bet.americanOdds > 0 ? `+${bet.americanOdds}` : bet.americanOdds}</td>
                <td className="px-5 py-4 text-slate-700">{formatCurrency(bet.stake)}</td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        bet.result === BetResult.ACTIVE ? "bg-amber-50 text-amber-700" : "bg-white text-slate-700"
                      }`}
                    >
                      {bet.result}
                    </span>
                    {bet.result === BetResult.ACTIVE ? (
                      <div className="text-xs text-slate-500">Potential payout {formatCurrency(bet.payout)}</div>
                    ) : null}
                  </div>
                </td>
                <td
                  className={`px-5 py-4 font-semibold ${
                    bet.result === BetResult.ACTIVE
                      ? "text-slate-400"
                      : bet.profitLoss >= 0
                        ? "text-[var(--profit)]"
                        : "text-[var(--loss)]"
                  }`}
                >
                  {bet.result === BetResult.ACTIVE ? "--" : formatCurrency(bet.profitLoss)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/bets/${bet.id}/edit`}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                    >
                      Edit
                    </Link>
                    <DeleteBetButton id={bet.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
