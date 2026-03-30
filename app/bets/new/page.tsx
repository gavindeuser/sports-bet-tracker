import { BetForm } from "@/components/bets/bet-form";
import { Card } from "@/components/ui/card";
import { getFilterOptions } from "@/lib/data/bets";

export const dynamic = "force-dynamic";

export default async function NewBetPage() {
  const { sports } = await getFilterOptions();

  return (
    <Card>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Add Bet</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Log a new wager</h2>
        <p className="mt-2 text-sm text-slate-600">Profit/loss will be computed automatically before the bet is saved.</p>
      </div>
      <BetForm mode="create" sports={sports} />
    </Card>
  );
}
