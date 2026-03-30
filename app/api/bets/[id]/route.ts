import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { NextResponse } from "next/server";

import { deleteBet, getBetById, updateBet } from "@/lib/data/bets";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const bet = await getBetById(id);
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  return NextResponse.json(bet);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const { id } = await params;
    const bet = await updateBet(id, payload);
    return NextResponse.json(bet);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update bet" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteBet(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete bet" }, { status: 500 });
  }
}
