import { PrismaClient } from "@prisma/client";

import { classifySport } from "../lib/utils/basketball-sport.ts";

const prisma = new PrismaClient();

async function main() {
  const bets = await prisma.bet.findMany({
    where: { sport: "Other" },
    select: { id: true, selection: true },
  });

  if (!bets.length) {
    console.log("No Other bets found to reclassify.");
    return;
  }

  const soccerBets = bets.filter((bet) => classifySport("Other", bet.selection) === "Soccer");

  if (!soccerBets.length) {
    console.log("No Soccer bets found inside Other.");
    return;
  }

  await prisma.$transaction(
    soccerBets.map((bet) =>
      prisma.bet.update({
        where: { id: bet.id },
        data: {
          sport: "Soccer",
          league: "Soccer",
        },
      }),
    ),
  );

  console.log(`Reclassified ${soccerBets.length} Other bets into Soccer.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
