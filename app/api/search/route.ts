import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  const results = await searchProducts(q);
  return NextResponse.json(results.slice(0, 6));
}
