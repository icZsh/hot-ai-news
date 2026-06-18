import { NextRequest, NextResponse } from "next/server";
import { requirePrivateAccess } from "@/lib/auth";
import { syncSelectedItems } from "@/lib/services/sync";

export async function POST(request: NextRequest) {
  const denied = requirePrivateAccess(request);
  if (denied) {
    return denied;
  }

  const result = await syncSelectedItems("manual-refresh");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
