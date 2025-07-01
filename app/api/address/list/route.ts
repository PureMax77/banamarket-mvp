import { NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

// 배송지 목록 조회 API
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const addresses = await db.deliveryAddress.findMany({
      where: {
        userId: session.id,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("배송지 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "배송지 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 