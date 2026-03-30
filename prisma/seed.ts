import { BetResult, PrismaClient } from "@prisma/client";

import { calculatePayoutFromOdds, calculateProfitLoss, normalizeLegs, roundToCents } from "../lib/calculations/betting";

const prisma = new PrismaClient();

type SeedBet = {
  datePlaced: string;
  dateSettled?: string;
  sport: string;
  league: string;
  event: string;
  betType: string;
  selection: string;
  americanOdds: number;
  stake: number;
  result: BetResult;
  isLive: boolean;
  isParlay: boolean;
  legs?: number;
  notes?: string;
};

function buildBet(seedBet: SeedBet) {
  const payout =
    seedBet.result === BetResult.WIN
      ? calculatePayoutFromOdds(seedBet.stake, seedBet.americanOdds)
      : seedBet.result === BetResult.LOSS
        ? 0
        : roundToCents(seedBet.stake);

  return {
    datePlaced: new Date(seedBet.datePlaced),
    dateSettled: seedBet.dateSettled ? new Date(seedBet.dateSettled) : null,
    sport: seedBet.sport,
    league: seedBet.league,
    event: seedBet.event,
    betType: seedBet.betType,
    selection: seedBet.selection,
    americanOdds: seedBet.americanOdds,
    stake: roundToCents(seedBet.stake),
    result: seedBet.result,
    payout,
    profitLoss: calculateProfitLoss({
      result: seedBet.result,
      payout,
      stake: seedBet.stake,
    }),
    isLive: seedBet.isLive,
    isParlay: seedBet.isParlay,
    legs: normalizeLegs(seedBet.isParlay, seedBet.legs),
    notes: seedBet.notes ?? null,
  };
}

const seedBets: SeedBet[] = [
  {
    datePlaced: "2025-09-05",
    dateSettled: "2025-09-05",
    sport: "NFL",
    league: "NFL",
    event: "Chiefs vs Ravens",
    betType: "Spread",
    selection: "Chiefs -3.5",
    americanOdds: -110,
    stake: 100,
    result: BetResult.WIN,
    isLive: false,
    isParlay: false,
    notes: "Season opener position.",
  },
  {
    datePlaced: "2025-09-12",
    dateSettled: "2025-09-12",
    sport: "NFL",
    league: "NFL",
    event: "Bills vs Dolphins",
    betType: "Parlay",
    selection: "Bills ML + Over 47.5",
    americanOdds: 260,
    stake: 35,
    result: BetResult.LOSS,
    isLive: false,
    isParlay: true,
    legs: 2,
  },
  {
    datePlaced: "2025-11-18",
    dateSettled: "2025-11-18",
    sport: "NBA",
    league: "NBA",
    event: "Celtics vs Knicks",
    betType: "Player Prop",
    selection: "Jayson Tatum over 28.5 points",
    americanOdds: -105,
    stake: 80,
    result: BetResult.WIN,
    isLive: true,
    isParlay: false,
  },
  {
    datePlaced: "2025-10-31",
    dateSettled: "2025-10-31",
    sport: "NBA",
    league: "NBA",
    event: "Lakers vs Suns",
    betType: "Moneyline",
    selection: "Lakers ML",
    americanOdds: 145,
    stake: 50,
    result: BetResult.PUSH,
    isLive: false,
    isParlay: false,
    notes: "Voided due to late scratch became push at book.",
  },
  {
    datePlaced: "2025-06-09",
    dateSettled: "2025-06-09",
    sport: "MLB",
    league: "MLB",
    event: "Dodgers vs Padres",
    betType: "Total",
    selection: "Under 8.5",
    americanOdds: -108,
    stake: 60,
    result: BetResult.LOSS,
    isLive: false,
    isParlay: false,
  },
  {
    datePlaced: "2025-07-03",
    dateSettled: "2025-07-03",
    sport: "MLB",
    league: "MLB",
    event: "Yankees vs Red Sox",
    betType: "Same Game Parlay",
    selection: "Judge HR + Yankees ML + Over 9.5",
    americanOdds: 525,
    stake: 20,
    result: BetResult.WIN,
    isLive: false,
    isParlay: true,
    legs: 3,
  },
  {
    datePlaced: "2025-01-11",
    dateSettled: "2025-01-11",
    sport: "NHL",
    league: "NHL",
    event: "Rangers vs Devils",
    betType: "Moneyline",
    selection: "Rangers ML",
    americanOdds: -125,
    stake: 75,
    result: BetResult.WIN,
    isLive: true,
    isParlay: false,
  },
  {
    datePlaced: "2025-02-02",
    dateSettled: "2025-02-02",
    sport: "NHL",
    league: "NHL",
    event: "Oilers vs Canucks",
    betType: "Puck Line",
    selection: "Canucks +1.5",
    americanOdds: -150,
    stake: 90,
    result: BetResult.VOID,
    isLive: false,
    isParlay: false,
    notes: "Goalie scratch void.",
  },
  {
    datePlaced: "2025-03-15",
    dateSettled: "2025-03-15",
    sport: "Soccer",
    league: "Premier League",
    event: "Arsenal vs Chelsea",
    betType: "Moneyline",
    selection: "Arsenal ML",
    americanOdds: 120,
    stake: 55,
    result: BetResult.WIN,
    isLive: false,
    isParlay: false,
  },
  {
    datePlaced: "2025-04-20",
    dateSettled: "2025-04-20",
    sport: "Soccer",
    league: "Champions League",
    event: "Real Madrid vs Bayern Munich",
    betType: "Parlay",
    selection: "BTTS + Over 2.5",
    americanOdds: 185,
    stake: 40,
    result: BetResult.LOSS,
    isLive: true,
    isParlay: true,
    legs: 2,
  },
  {
    datePlaced: "2025-08-29",
    dateSettled: "2025-08-29",
    sport: "Tennis",
    league: "US Open",
    event: "Alcaraz vs Rublev",
    betType: "Set Betting",
    selection: "Alcaraz 3-1",
    americanOdds: 310,
    stake: 25,
    result: BetResult.WIN,
    isLive: false,
    isParlay: false,
  },
  {
    datePlaced: "2025-08-30",
    dateSettled: "2025-08-30",
    sport: "Tennis",
    league: "US Open",
    event: "Sabalenka vs Gauff",
    betType: "Total Games",
    selection: "Over 21.5 games",
    americanOdds: -115,
    stake: 45,
    result: BetResult.LOSS,
    isLive: true,
    isParlay: false,
  }
];

async function main() {
  const existingCount = await prisma.bet.count();

  if (existingCount > 0) {
    console.log("Seed skipped because bets already exist.");
    return;
  }

  await prisma.bet.createMany({
    data: seedBets.map(buildBet),
  });

  console.log(`Seeded ${seedBets.length} bets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
