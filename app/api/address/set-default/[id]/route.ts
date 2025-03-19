import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

// 기본 배송지 설정 API
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    // 로그인 확인
    if (!session.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const addressId = parseInt(params.id);
    
    if (isNaN(addressId)) {
      return NextResponse.json(
        { error: "유효하지 않은 주소 ID입니다." },
        { status: 400 }
      );
    }

    // 해당 주소가 현재 사용자의 것인지 확인
    const existingAddress = await db.deliveryAddress.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: "해당 배송지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingAddress.userId !== session.id) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 이미 기본 배송지로 설정되어 있으면 그대로 반환
    if (existingAddress.isDefault) {
      return NextResponse.json(existingAddress);
    }

    // 다른 모든 주소의 기본 배송지 설정 해제
    await db.deliveryAddress.updateMany({
      where: {
        userId: session.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // 현재 주소를 기본 배송지로 설정
    const updatedAddress = await db.deliveryAddress.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("기본 배송지 설정 오류:", error);
    return NextResponse.json(
      { error: "기본 배송지 설정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 