import { NextRequest, NextResponse } from "next/server";
import { requirePrivateAccess } from "@/lib/auth";
import { getPersonalState, upsertNote } from "@/lib/services/personal";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!targetType || !targetId) {
    return NextResponse.json(
      { error: "targetType and targetId are required." },
      { status: 400 },
    );
  }

  const state = await getPersonalState(targetType, targetId);
  return NextResponse.json(state, { status: state.available ? 200 : 503 });
}

export async function POST(request: NextRequest) {
  const denied = requirePrivateAccess(request);
  if (denied) {
    return denied;
  }

  const body = (await request.json()) as {
    targetType?: string;
    targetId?: string;
    content?: string;
  };

  if (!body.targetType || !body.targetId) {
    return NextResponse.json(
      { error: "targetType and targetId are required." },
      { status: 400 },
    );
  }

  const state = await upsertNote({
    targetType: body.targetType,
    targetId: body.targetId,
    content: body.content ?? "",
  });

  return NextResponse.json(state, { status: state.available ? 200 : 503 });
}
