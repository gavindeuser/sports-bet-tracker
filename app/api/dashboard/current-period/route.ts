import { NextResponse } from "next/server";

import { resetCurrentPeriod } from "@/lib/data/app-config";

export async function POST() {
  try {
    const config = await resetCurrentPeriod();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to reset current period" }, { status: 500 });
  }
}
