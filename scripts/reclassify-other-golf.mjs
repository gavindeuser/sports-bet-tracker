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

  const golfBets = bets.filter((bet) => classifySport("Other", bet.selection) === "Golf");

  if (!golfBets.length) {
    console.log("No Golf bets found inside Other.");
    return;
  }

  await prisma.$transaction(
    golfBets.map((bet) =>
      prisma.bet.update({
        where: { id: bet.id },
        data: {
          sport: "Golf",
          league: "Golf",
        },
      }),
    ),
  );

  console.log(`Reclassified ${golfBets.length} Other bets into Golf.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
