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

  const hockeyBets = bets.filter((bet) => classifySport("Other", bet.selection) === "Hockey");

  if (!hockeyBets.length) {
    console.log("No Hockey bets found inside Other.");
    return;
  }

  await prisma.$transaction(
    hockeyBets.map((bet) =>
      prisma.bet.update({
        where: { id: bet.id },
        data: {
          sport: "Hockey",
          league: "Hockey",
        },
      }),
    ),
  );

  console.log(`Reclassified ${hockeyBets.length} Other bets into Hockey.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
