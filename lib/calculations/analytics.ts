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

function getBaseMetrics(bets: Bet[]): AggregateMetrics {
  const wins = bets.filter((bet) => bet.result === BetResult.WIN).length;
  const losses = bets.filter((bet) => bet.result === BetResult.LOSS).length;
  const totalStaked = roundToCents(bets.reduce((sum, bet) => sum + bet.stake, 0));
  const totalPayout = roundToCents(bets.reduce((sum, bet) => sum + bet.payout, 0));
  const totalProfit = roundToCents(bets.reduce((sum, bet) => sum + bet.profitLoss, 0));

  return {
    totalBets: bets.length,
    totalStaked,
    totalPayout,
    totalProfit,
    averageStake: bets.length ? roundToCents(totalStaked / bets.length) : 0,
    wins,
    losses,
    winRate: calculateWinRate(wins, losses),
    roi: calculateRoi(totalProfit, totalStaked),
  };
}

export function getDashboardMetrics(bets: Bet[]) {
  return getBaseMetrics(bets);
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

export function getCumulativeProfitSeries(bets: Bet[]): CumulativeProfitPoint[] {
  let runningProfit = 0;

  return [...bets]
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

  bets.forEach((bet) => {
    const month = bet.datePlaced.toISOString().slice(0, 7);
    months.set(month, roundToCents((months.get(month) ?? 0) + bet.profitLoss));
  });

  return Array.from(months.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, profit]) => ({ month, profit }));
}

export function getBetVolumeSeries(bets: Bet[]): BetVolumePoint[] {
  const counts = new Map<string, number>();

  bets.forEach((bet) => {
    const date = bet.datePlaced.toISOString().slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, bets: count }));
}
