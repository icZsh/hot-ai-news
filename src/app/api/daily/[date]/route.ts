import { NextResponse } from "next/server";
import { getDailyByLocalDateForPage } from "@/lib/services/daily";

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { date } = await context.params;
  const result = await getDailyByLocalDateForPage(date, 300);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
