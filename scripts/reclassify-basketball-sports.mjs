import { PrismaClient } from "@prisma/client";

import { classifyBasketballSport } from "../lib/utils/basketball-sport.ts";

const prisma = new PrismaClient();

async function main() {
  const bets = await prisma.bet.findMany({
    where: { sport: "Basketball" },
    select: { id: true, selection: true },
  });

  if (!bets.length) {
    console.log("No Basketball bets found to reclassify.");
    return;
  }

  let nbaCount = 0;
  let ncaabCount = 0;

  await prisma.$transaction(
    bets.map((bet) => {
      const nextSport = classifyBasketballSport("Basketball", bet.selection);

      if (nextSport === "NBA") {
        nbaCount += 1;
      } else {
        ncaabCount += 1;
      }

      return prisma.bet.update({
        where: { id: bet.id },
        data: {
          sport: nextSport,
          league: nextSport,
        },
      });
    }),
  );

  console.log(`Reclassified ${bets.length} Basketball bets.`);
  console.log(`NBA: ${nbaCount}`);
  console.log(`NCAAB: ${ncaabCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
