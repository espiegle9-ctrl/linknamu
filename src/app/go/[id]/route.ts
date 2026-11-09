import { NextResponse } from "next/server";
import { recordClick } from "@/lib/data";

// 링크 클릭 → 클릭 수 +1 → 원래 URL로 이동
export async function GET(request: Request, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params;
  try {
    const url = await recordClick(id);
    if (!url) return new NextResponse("링크를 찾을 수 없습니다.", { status: 404 });
    return NextResponse.redirect(url, 307);
  } catch (error) {
    console.error("클릭 집계 실패", error);
    return new NextResponse("일시적인 오류가 발생했습니다.", { status: 500 });
  }
}
