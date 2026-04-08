import { Bet, BetResult } from "@prisma/client";

import { calculateRoi, calculateWinRate, roundToCents } from "@/lib/calculations/betting";

type AggregateMetrics = {
  totalBets: number;
  totalStaked: number;
  totalPayout: number;
  totalProfit: number;
  averageStake: number;
  wins: number;
  losses: number;
  winRate: number;
  roi: number;
};

export type SportBreakdown = AggregateMetrics & {
  sport: string;
};

export type BetTypeBreakdown = AggregateMetrics & {
  label: "Straight" | "Parlay";
};

export type CumulativeProfitPoint = {
  date: string;
  profit: number;
};

export type MonthlyProfitPoint = {
  month: string;
  profit: number;
};

export type BetVolumePoint = {
  date: string;
  bets: number;
};

function getSettledBets(bets: Bet[]) {
  return bets.filter((bet) => bet.result !== BetResult.ACTIVE);
}

export function getCurrentPeriodProfit(bets: Bet[], currentPeriodStart: Date | null) {
  const relevantBets = currentPeriodStart
    ? getSettledBets(bets).filter((bet) => bet.createdAt.getTime() >= currentPeriodStart.getTime())
    : getSettledBets(bets);

  return roundToCents(relevantBets.reduce((sum, bet) => sum + bet.profitLoss, 0));
}

function getBaseMetrics(bets: Bet[], options?: { countAllBets?: boolean }): AggregateMetrics {
  const settledBets = getSettledBets(bets);
  const wins = settledBets.filter((bet) => bet.result === BetResult.WIN).length;
  const losses = settledBets.filter((bet) => bet.result === BetResult.LOSS).length;
  const totalStaked = roundToCents(settledBets.reduce((sum, bet) => sum + bet.stake, 0));
  const totalPayout = roundToCents(settledBets.reduce((sum, bet) => sum + bet.payout, 0));
  const totalProfit = roundToCents(settledBets.reduce((sum, bet) => sum + bet.profitLoss, 0));

  return {
    totalBets: options?.countAllBets ? bets.length : settledBets.length,
    totalStaked,
    totalPayout,
    totalProfit,
    averageStake: settledBets.length ? roundToCents(totalStaked / settledBets.length) : 0,
    wins,
    losses,
    winRate: calculateWinRate(wins, losses),
    roi: calculateRoi(totalProfit, totalStaked),
  };
}

export function getDashboardMetrics(bets: Bet[]) {
  return getBaseMetrics(bets, { countAllBets: true });
}

export function getSportBreakdown(bets: Bet[]): SportBreakdown[] {
  const bySport = new Map<string, Bet[]>();

  bets.forEach((bet) => {
    const collection = bySport.get(bet.sport) ?? [];
    collection.push(bet);
    bySport.set(bet.sport, collection);
  });

  return Array.from(bySport.entries())
    .map(([sport, sportBets]) => ({
      sport,
      ...getBaseMetrics(sportBets),
    }))
    .sort((left, right) => right.totalProfit - left.totalProfit);
}

export function getBetTypeBreakdown(bets: Bet[]): BetTypeBreakdown[] {
  return [
    {
      label: "Straight",
      ...getBaseMetrics(bets.filter((bet) => !bet.isParlay)),
    },
    {
      label: "Parlay",
      ...getBaseMetrics(bets.filter((bet) => bet.isParlay)),
    },
  ];
}

export function getCumulativeProfitSeries(bets: Bet[]): CumulativeProfitPoint[] {
  let runningProfit = 0;

  return [...getSettledBets(bets)]
    .sort((left, right) => left.datePlaced.getTime() - right.datePlaced.getTime())
    .map((bet) => {
      runningProfit = roundToCents(runningProfit + bet.profitLoss);
      return {
        date: bet.datePlaced.toISOString().slice(0, 10),
        profit: runningProfit,
      };
    });
}

export function getMonthlyProfitSeries(bets: Bet[]): MonthlyProfitPoint[] {
  const months = new Map<string, number>();

  getSettledBets(bets).forEach((bet) => {
    const month = bet.datePlaced.toISOString().slice(0, 7);
    months.set(month, roundToCents((months.get(month) ?? 0) + bet.profitLoss));
  });

  return Array.from(months.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, profit]) => ({ month, profit }));
}

export function getBetVolumeSeries(bets: Bet[]): BetVolumePoint[] {
  const counts = new Map<string, number>();

  getSettledBets(bets).forEach((bet) => {
    const date = bet.datePlaced.toISOString().slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, bets: count }));
}
