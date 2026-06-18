import { NextResponse } from "next/server";
import { getLatestDailyForPage } from "@/lib/services/daily";

export async function GET() {
  const result = await getLatestDailyForPage(300);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
