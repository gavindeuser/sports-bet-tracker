import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { duplicateBet } from "@/lib/data/bets";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const bet = await duplicateBet(id);
    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }
    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to duplicate bet" }, { status: 500 });
  }
}
