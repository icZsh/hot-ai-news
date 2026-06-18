import { NextRequest, NextResponse } from "next/server";
import { requirePrivateAccess } from "@/lib/auth";
import { syncDailyReport } from "@/lib/services/sync";

export async function POST(request: NextRequest) {
  const denied = requirePrivateAccess(request);
  if (denied) {
    return denied;
  }

  const result = await syncDailyReport("sync-daily");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
