import { Bet, BetResult, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { calculateProfitLoss } from "@/lib/calculations/betting";
import type { BetFilters } from "@/lib/utils/query";
import { parseBetInput } from "@/lib/validations/bet";

function parseDateBoundary(value: string, boundary: "start" | "end") {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return boundary === "start"
    ? new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    : new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

function buildWhere(filters: BetFilters): Prisma.BetWhereInput {
  const startDate = filters.startDate ? parseDateBoundary(filters.startDate, "start") : undefined;
  const endDate = filters.endDate ? parseDateBoundary(filters.endDate, "end") : undefined;

  return {
    ...(startDate || endDate
      ? {
          datePlaced: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
    ...(filters.sport ? { sport: filters.sport } : {}),
    ...(filters.result ? { result: filters.result as BetResult } : {}),
    ...(filters.betType ? { betType: filters.betType } : {}),
    ...(filters.timing ? { isLive: filters.timing === "live" } : {}),
    ...(filters.wager ? { isParlay: filters.wager === "parlay" } : {}),
  };
}

export async function getBets(filters: BetFilters = {}) {
  return prisma.bet.findMany({
    where: buildWhere(filters),
    orderBy: {
      datePlaced: filters.sort === "asc" ? "asc" : "desc",
    },
  });
}

export async function getBetById(id: string) {
  return prisma.bet.findUnique({
    where: { id },
  });
}

export async function getBetByIdOrThrow(id: string) {
  const bet = await getBetById(id);
  if (!bet) {
    notFound();
  }

  return bet;
}

export async function getFilterOptions() {
  const [sports, betTypes] = await Promise.all([
    prisma.bet.findMany({
      distinct: ["sport"],
      select: { sport: true },
      orderBy: { sport: "asc" },
    }),
    prisma.bet.findMany({
      distinct: ["betType"],
      select: { betType: true },
      orderBy: { betType: "asc" },
    }),
  ]);

  return {
    sports: sports.map((item) => item.sport),
    betTypes: betTypes.map((item) => item.betType),
    results: Object.values(BetResult),
  };
}

export async function createBet(payload: unknown) {
  const data = parseBetInput(payload);
  return prisma.bet.create({ data });
}

export async function updateBet(id: string, payload: unknown) {
  const data = parseBetInput(payload);
  return prisma.bet.update({
    where: { id },
    data,
  });
}

export async function deleteBet(id: string) {
  return prisma.bet.delete({
    where: { id },
  });
}

export async function duplicateBet(id: string) {
  const original = await getBetById(id);

  if (!original) {
    return null;
  }

  const { id: originalId, createdAt: originalCreatedAt, updatedAt: originalUpdatedAt, ...rest } = original as Bet;
  void originalId;
  void originalCreatedAt;
  void originalUpdatedAt;

  return prisma.bet.create({
    data: {
      ...rest,
      profitLoss: calculateProfitLoss({
        result: rest.result,
        payout: rest.payout,
        stake: rest.stake,
      }),
      notes: rest.notes ? `${rest.notes} (duplicated)` : "Duplicated bet",
    },
  });
}
