import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import { PrismaClient, BetResult } from "@prisma/client";
import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const prisma = new PrismaClient();
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  processEntities: false,
  trimValues: false,
});

const REQUIRED_COLUMNS = ["A", "B", "C", "D", "E", "G"];
const DEFAULT_FILE = "/Users/gavindeuser/Downloads/Bet Tracker Fully Automated.xlsx";

function excelDateToIso(serial) {
  const wholeDays = Math.floor(serial);
  const utcDays = wholeDays - 25569;
  const utcValue = utcDays * 86400 * 1000;
  return new Date(utcValue).toISOString().slice(0, 10);
}

function ensureArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeResult(value) {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (normalized === "WIN") {
    return BetResult.WIN;
  }

  if (normalized === "LOSS") {
    return BetResult.LOSS;
  }

  if (normalized === "PUSH") {
    return BetResult.PUSH;
  }

  if (normalized === "VOID") {
    return BetResult.VOID;
  }

  return null;
}

function inferBetType(selection) {
  const text = selection.toLowerCase();

  if (text.includes("sgp")) {
    return "Same Game Parlay";
  }

  if (text.includes("parlay") || text.includes("/")) {
    return "Parlay";
  }

  return "Straight";
}

function inferParlay(selection) {
  const text = selection.toLowerCase();
  return text.includes("sgp") || text.includes("parlay") || text.includes("/");
}

function inferLegs(selection, isParlay) {
  if (!isParlay) {
    return 1;
  }

  const slashLegs = selection
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean).length;

  return Math.max(2, slashLegs || 2);
}

function deriveLeague(rawSport) {
  return rawSport;
}

function deriveEvent(selection) {
  return selection;
}

function backupDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destination = `${dbPath}.${stamp}.bak`;
  fs.copyFileSync(dbPath, destination);
  return destination;
}

async function getSharedStrings(zip) {
  const sharedStringsEntry = zip.files["xl/sharedStrings.xml"];
  if (!sharedStringsEntry) {
    return [];
  }

  const sharedStringsXml = await sharedStringsEntry.async("text");
  const sharedStringsDoc = parser.parse(sharedStringsXml);
  const items = ensureArray(sharedStringsDoc.sst?.si);

  return items.map((item) => {
    const runs = ensureArray(item.r);

    if (runs.length > 0) {
      return runs.map((run) => run.t?.["#text"] ?? run.t ?? "").join("");
    }

    return item.t?.["#text"] ?? item.t ?? "";
  });
}

function extractCellValue(cell, sharedStrings) {
  const raw = cell.v;

  if (raw === undefined || raw === null || raw === "") {
    return "";
  }

  const value = typeof raw === "object" ? raw["#text"] ?? "" : raw;

  if (cell.t === "s") {
    return sharedStrings[Number(value)] ?? "";
  }

  return String(value);
}

async function loadRows(filePath) {
  const JSZip = (await import("jszip")).default;
  const workbookBuffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(workbookBuffer);
  const sharedStrings = await getSharedStrings(zip);
  const worksheetXml = await zip.files["xl/worksheets/sheet1.xml"].async("text");
  const worksheetDoc = parser.parse(worksheetXml);
  const rows = ensureArray(worksheetDoc.worksheet?.sheetData?.row);

  return rows.map((row) => {
    const cells = ensureArray(row.c);
    const values = {};

    for (const cell of cells) {
      const reference = String(cell.r ?? "");
      const column = reference.replace(/\d+/g, "");
      values[column] = extractCellValue(cell, sharedStrings);
    }

    return {
      rowNumber: Number(row.r),
      values,
    };
  });
}

function buildImportedBet(row) {
  const { rowNumber, values } = row;

  if (!REQUIRED_COLUMNS.every((column) => String(values[column] ?? "").trim() !== "")) {
    return null;
  }

  const result = normalizeResult(values.G);
  if (!result) {
    return null;
  }

  const serialDate = Number(values.A);
  const stake = Number(values.D);
  const americanOdds = Number(values.E);
  const rawProfit = Number(values.I || 0);
  const rawSport = String(values.B).trim();
  const selection = String(values.C).trim();

  if (!Number.isFinite(serialDate) || !Number.isFinite(stake) || !Number.isFinite(americanOdds) || !rawSport || !selection) {
    return null;
  }

  const isParlay = inferParlay(selection);
  const legs = inferLegs(selection, isParlay);
  const payout =
    result === BetResult.WIN
      ? Number((stake + rawProfit).toFixed(2))
      : result === BetResult.LOSS
        ? 0
        : Number(stake.toFixed(2));

  return {
    datePlaced: new Date(`${excelDateToIso(serialDate)}T12:00:00.000Z`),
    dateSettled: new Date(`${excelDateToIso(serialDate)}T12:00:00.000Z`),
    sport: rawSport,
    league: deriveLeague(rawSport),
    event: deriveEvent(selection),
    betType: inferBetType(selection),
    selection,
    americanOdds: Math.trunc(americanOdds),
    stake: Number(stake.toFixed(2)),
    result,
    payout,
    profitLoss:
      result === BetResult.WIN
        ? Number(rawProfit.toFixed(2))
        : result === BetResult.LOSS
          ? Number((-stake).toFixed(2))
          : 0,
    isLive: false,
    isParlay,
    legs,
    notes: `Imported from spreadsheet row ${rowNumber}`,
  };
}

async function main() {
  const { values } = parseArgs({
    options: {
      file: { type: "string", default: DEFAULT_FILE },
      append: { type: "boolean", default: false },
      preview: { type: "boolean", default: false },
    },
  });

  const filePath = path.resolve(values.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Spreadsheet not found: ${filePath}`);
  }

  const rows = await loadRows(filePath);
  const importedBets = rows.map(buildImportedBet).filter(Boolean);

  if (importedBets.length === 0) {
    throw new Error("No importable bets were found in the spreadsheet.");
  }

  const databasePath = path.join(process.cwd(), "prisma", "dev.db");
  const digest = createHash("sha256").update(JSON.stringify(importedBets)).digest("hex").slice(0, 12);

  if (values.preview) {
    console.log(`Preview found ${importedBets.length} importable bets from ${filePath}`);
    console.log(`Import digest: ${digest}`);
    console.log("First five imported bets:");
    console.log(
      JSON.stringify(
        importedBets.slice(0, 5).map((bet) => ({
          datePlaced: bet.datePlaced.toISOString().slice(0, 10),
          sport: bet.sport,
          selection: bet.selection,
          stake: bet.stake,
          americanOdds: bet.americanOdds,
          result: bet.result,
          payout: bet.payout,
          isParlay: bet.isParlay,
          legs: bet.legs,
        })),
        null,
        2,
      ),
    );
    return;
  }

  const backupPath = backupDatabase(databasePath);

  await prisma.$transaction(async (tx) => {
    if (!values.append) {
      await tx.bet.deleteMany();
    }

    await tx.bet.createMany({
      data: importedBets,
    });
  });

  console.log(`Imported ${importedBets.length} bets from ${filePath}`);
  console.log(`Import digest: ${digest}`);

  if (backupPath) {
    console.log(`Database backup created at ${backupPath}`);
  }

  console.log("Import assumptions:");
  console.log("- league mirrors the workbook's sport column because no separate league field exists");
  console.log("- event mirrors selection because the sheet does not contain a dedicated event column");
  console.log("- betType is inferred from selection text (Straight, Parlay, or Same Game Parlay)");
  console.log("- all imported bets are marked as settled on the listed date and as pregame");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
