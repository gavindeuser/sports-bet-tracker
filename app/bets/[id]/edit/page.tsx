import { BetForm } from "@/components/bets/bet-form";
import { Card } from "@/components/ui/card";
import { getBetByIdOrThrow, getFilterOptions } from "@/lib/data/bets";

export const dynamic = "force-dynamic";

type EditBetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBetPage({ params }: EditBetPageProps) {
  const { id } = await params;
  const [bet, { sports }] = await Promise.all([getBetByIdOrThrow(id), getFilterOptions()]);

  return (
    <Card>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Edit Bet</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Update tracked wager</h2>
        <p className="mt-2 text-sm text-slate-600">Changes here will be persisted directly to the database.</p>
      </div>
      <BetForm mode="edit" initialValues={bet} sports={sports} />
    </Card>
  );
}
