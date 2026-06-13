import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/db/queries";

// Resolves client-held product ids (wishlist lives in localStorage) to
// full products. Order of the response follows the order of `ids`.
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (ids.length === 0) return NextResponse.json([]);
  return NextResponse.json(await getProductsByIds(ids));
}
