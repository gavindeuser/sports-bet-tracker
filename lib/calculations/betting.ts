import { BetResult } from "@prisma/client";

export type BetMathInput = {
  result: BetResult;
  payout: number;
  stake: number;
};

export function roundToCents(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateProfitLoss({ result, payout, stake }: BetMathInput) {
  if (!Number.isFinite(stake) || !Number.isFinite(payout)) {
    return 0;
  }

  if (result === BetResult.WIN) {
    return roundToCents(payout - stake);
  }

  if (result === BetResult.LOSS) {
    return roundToCents(-stake);
  }

  return 0;
}

export function calculateRoi(totalProfit: number, totalStaked: number) {
  if (!Number.isFinite(totalProfit) || !Number.isFinite(totalStaked) || totalStaked <= 0) {
    return 0;
  }

  return totalProfit / totalStaked;
}

export function calculateWinRate(wins: number, losses: number) {
  const decisions = wins + losses;
  if (decisions <= 0) {
    return 0;
  }

  return wins / decisions;
}

export function calculateImpliedProbability(americanOdds: number) {
  if (!Number.isFinite(americanOdds) || americanOdds === 0) {
    return 0;
  }

  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  }

  const absoluteOdds = Math.abs(americanOdds);
  return absoluteOdds / (absoluteOdds + 100);
}

export function calculatePayoutFromOdds(stake: number, americanOdds: number) {
  if (!Number.isFinite(stake) || !Number.isFinite(americanOdds) || stake <= 0 || americanOdds === 0) {
    return 0;
  }

  if (americanOdds > 0) {
    return roundToCents(stake + stake * (americanOdds / 100));
  }

  return roundToCents(stake + stake * (100 / Math.abs(americanOdds)));
}

export function normalizeLegs(isParlay: boolean, legs?: number | null) {
  if (!isParlay) {
    return 1;
  }

  const safeLegs = Math.trunc(legs ?? 2);
  return safeLegs > 1 ? safeLegs : 2;
}
