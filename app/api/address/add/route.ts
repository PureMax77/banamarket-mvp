import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

// 배송지 추가 API
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    // 로그인 확인
    if (!session.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, zipCode, address, detailAddress, memo, isDefault } = body;

    // 필수 필드 검증
    if (!name || !phone || !zipCode || !address) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 기본 배송지로 설정하는 경우 기존 기본 배송지 해제
    if (isDefault) {
      await db.deliveryAddress.updateMany({
        where: {
          userId: session.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 새 배송지 생성
    const newAddress = await db.deliveryAddress.create({
      data: {
        name,
        phone,
        zipCode,
        address,
        detailAddress,
        memo: memo || "",
        isDefault,
        userId: session.id,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("배송지 추가 오류:", error);
    return NextResponse.json(
      { error: "배송지 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 