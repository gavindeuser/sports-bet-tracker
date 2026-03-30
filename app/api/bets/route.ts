import { ZodError } from "zod";
import { NextResponse } from "next/server";

import { createBet, getBets } from "@/lib/data/bets";
import { parseBetFilters } from "@/lib/utils/query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bets = await getBets(
    parseBetFilters({
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      sport: searchParams.get("sport") ?? undefined,
      result: searchParams.get("result") ?? undefined,
      betType: searchParams.get("betType") ?? undefined,
      timing: searchParams.get("timing") ?? undefined,
      wager: searchParams.get("wager") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    }),
  );

  return NextResponse.json(bets);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const bet = await createBet(payload);
    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 });
  }
}
