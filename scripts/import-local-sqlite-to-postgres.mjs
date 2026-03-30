import { execFileSync } from "node:child_process";
import process from "node:process";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function exportSqliteRows(sqlitePath) {
  const pythonScript = `
import json
import sqlite3
import sys

sqlite_path = sys.argv[1]
conn = sqlite3.connect(sqlite_path)
conn.row_factory = sqlite3.Row
rows = conn.execute("""
  SELECT
    id,
    datePlaced,
    dateSettled,
    sport,
    league,
    event,
    betType,
    selection,
    americanOdds,
    stake,
    result,
    payout,
    profitLoss,
    isLive,
    isParlay,
    legs,
    notes,
    createdAt,
    updatedAt
  FROM Bet
  ORDER BY createdAt ASC
""").fetchall()
print(json.dumps([dict(row) for row in rows]))
conn.close()
`;

  const output = execFileSync("python3", ["-c", pythonScript, sqlitePath], {
    encoding: "utf8",
  });

  return JSON.parse(output);
}

function toDate(value) {
  return value ? new Date(value) : null;
}

async function main() {
  const sqlitePath = process.argv[2] ?? "prisma/dev.db";
  const rows = exportSqliteRows(sqlitePath);

  if (!rows.length) {
    console.log("No local bets found to import.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.bet.deleteMany();
    await tx.bet.createMany({
      data: rows.map((row) => ({
        id: row.id,
        datePlaced: toDate(row.datePlaced),
        dateSettled: toDate(row.dateSettled),
        sport: row.sport,
        league: row.league,
        event: row.event,
        betType: row.betType,
        selection: row.selection,
        americanOdds: row.americanOdds,
        stake: row.stake,
        result: row.result,
        payout: row.payout,
        profitLoss: row.profitLoss,
        isLive: Boolean(row.isLive),
        isParlay: Boolean(row.isParlay),
        legs: row.legs,
        notes: row.notes,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      })),
    });
  });

  console.log(`Imported ${rows.length} bets from ${sqlitePath} into the current Postgres database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
