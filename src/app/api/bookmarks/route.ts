import { NextRequest, NextResponse } from "next/server";
import { requirePrivateAccess } from "@/lib/auth";
import {
  deleteBookmark,
  getPersonalState,
  listBookmarkedItems,
  upsertBookmark,
} from "@/lib/services/personal";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (targetType && targetId) {
    const state = await getPersonalState(targetType, targetId);
    return NextResponse.json(state, { status: state.available ? 200 : 503 });
  }

  const result = await listBookmarkedItems({
    status: searchParams.get("status") ?? undefined,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export async function POST(request: NextRequest) {
  const denied = requirePrivateAccess(request);
  if (denied) {
    return denied;
  }

  const body = (await request.json()) as {
    targetType?: string;
    targetId?: string;
    status?: string;
    personalTags?: string[];
  };

  if (!body.targetType || !body.targetId) {
    return NextResponse.json(
      { error: "targetType and targetId are required." },
      { status: 400 },
    );
  }

  const state = await upsertBookmark({
    targetType: body.targetType,
    targetId: body.targetId,
    status: body.status as Parameters<typeof upsertBookmark>[0]["status"],
    personalTags: Array.isArray(body.personalTags) ? body.personalTags : [],
  });

  return NextResponse.json(state, { status: state.available ? 200 : 503 });
}

export async function DELETE(request: NextRequest) {
  const denied = requirePrivateAccess(request);
  if (denied) {
    return denied;
  }

  const searchParams = request.nextUrl.searchParams;
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!targetType || !targetId) {
    return NextResponse.json(
      { error: "targetType and targetId are required." },
      { status: 400 },
    );
  }

  const state = await deleteBookmark(targetType, targetId);
  return NextResponse.json(state, { status: state.available ? 200 : 503 });
}
