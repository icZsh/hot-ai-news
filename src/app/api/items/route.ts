import { NextRequest, NextResponse } from "next/server";
import { getItemsForPage } from "@/lib/services/items";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const take = Number(searchParams.get("take") ?? "100");
  const result = await getItemsForPage({
    category: searchParams.get("category") ?? searchParams.get("mode") ?? "all",
    take: Number.isFinite(take) ? take : 100,
    revalidate: 300,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
