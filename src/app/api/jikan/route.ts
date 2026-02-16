import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchAnime, searchManga } from "@/lib/jikan";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  const type = request.nextUrl.searchParams.get("type") || "anime";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results =
      type === "manga" ? await searchManga(q) : await searchAnime(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
