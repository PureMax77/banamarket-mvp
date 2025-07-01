import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

// 배송지 삭제 API
export async function DELETE(
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
    const address = await db.deliveryAddress.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "해당 배송지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (address.userId !== session.id) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 배송지 삭제
    await db.deliveryAddress.delete({
      where: {
        id: addressId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("배송지 삭제 오류:", error);
    return NextResponse.json(
      { error: "배송지 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 