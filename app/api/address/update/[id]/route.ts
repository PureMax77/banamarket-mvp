import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

// 배송지 수정 API
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

    // 업데이트할 데이터 추출
    const body = await req.json();
    const { name, phone, zipCode, address, detailAddress, memo, isDefault } = body;

    // 필수 필드 검증
    if (!name || !phone || !zipCode || !address) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
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

    // 기본 배송지로 설정하는 경우 기존 기본 배송지 해제
    if (isDefault && !existingAddress.isDefault) {
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

    // 배송지 수정
    const updatedAddress = await db.deliveryAddress.update({
      where: {
        id: addressId,
      },
      data: {
        name,
        phone,
        zipCode,
        address,
        detailAddress,
        memo: memo || "",
        isDefault,
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("배송지 수정 오류:", error);
    return NextResponse.json(
      { error: "배송지 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 