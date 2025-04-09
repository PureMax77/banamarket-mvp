import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const year = searchParams.get("year");

    // 기본 쿼리 조건
    let where: any = {
      userId: session.id,
      ...(status ? { status } : {}),
    };
    
    // 연도 필터링 추가
    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00Z`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00Z`);
      
      where.created_at = {
        gte: startDate,
        lt: endDate,
      };
    }

    const orders = await db.order.findMany({
      where,
      include: {
        product: {
          select: {
            title: true,
            photo: true,
          },
        },
        orderOptions: {
          include: {
            productOption: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("주문 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "주문 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
