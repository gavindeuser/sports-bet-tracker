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

  const motorsportsBets = bets.filter(
    (bet) => classifySport("Other", bet.selection) === "Motorsports",
  );

  if (!motorsportsBets.length) {
    console.log("No Motorsports bets found inside Other.");
    return;
  }

  await prisma.$transaction(
    motorsportsBets.map((bet) =>
      prisma.bet.update({
        where: { id: bet.id },
        data: {
          sport: "Motorsports",
          league: "Motorsports",
        },
      }),
    ),
  );

  console.log(`Reclassified ${motorsportsBets.length} Other bets into Motorsports.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
