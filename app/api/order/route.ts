import { NextResponse } from "next/server";
import getSession from "@/lib/session";
import db from "@/lib/db";
import { OrderStatus, User } from "@prisma/client";

// seller 타입을 위한 인터페이스 정의
interface SellerWithBankInfo extends User {
  bankType: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
}

export async function POST(req: Request) {
  try {
    // 인증 확인
    const session = await getSession();
    
    if (!session || !session.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." }, 
        { status: 401 }
      );
    }
    
    const userId = session.id;

    // 요청 본문 파싱
    const body = await req.json();
    const { 
      product,
      selectedOptions,
      selectedAddress,
      depositorName,
      totalAmount
    } = body;

    if (!product || !selectedOptions || !selectedAddress || !depositorName) {
      return NextResponse.json(
        { error: "필수 입력 값이 누락되었습니다." }, 
        { status: 400 }
      );
    }

    // 상품 존재 여부 확인
    const productExists = await db.product.findUnique({
      where: { id: product.id },
      include: { 
        options: true,
        farm: {
          include: {
            user: true // 농장 소유자 정보 포함
          }
        }
      }
    });

    if (!productExists) {
      return NextResponse.json(
        { error: "존재하지 않는 상품입니다." }, 
        { status: 400 }
      );
    }

    // 판매자 계좌 정보 확인
    const seller = productExists.farm.user as SellerWithBankInfo;

    if (!seller.bankType || !seller.accountNumber || !seller.accountHolder) {
      return NextResponse.json(
        { error: "판매자의 계좌 정보가 등록되어 있지 않습니다." }, 
        { status: 400 }
      );
    }

    // 선택된 옵션이 실제 DB에 존재하는지 검증
    const optionIds = selectedOptions.map((option: any) => option.id);
    
    // 실제 DB에 있는 옵션 조회
    const dbOptions = await db.productOption.findMany({
      where: {
        id: { in: optionIds },
        productId: product.id
      }
    });

    // 모든 선택된 옵션이 DB에 존재하는지 확인
    if (dbOptions.length !== optionIds.length) {
      return NextResponse.json(
        { error: "존재하지 않는 옵션이 포함되어 있습니다." }, 
        { status: 400 }
      );
    }
 
    // 옵션 가격 검증
    const validatedOptions = selectedOptions.map((clientOption: any) => {
      const dbOption = dbOptions.find(o => o.id === clientOption.id);
      
      if (!dbOption || dbOption.price !== clientOption.price) {
        throw new Error("옵션 가격이 일치하지 않습니다.");
      }
      
      return {
        id: clientOption.id,
        title: dbOption.title, // DB에서 조회한 옵션 제목 사용
        price: dbOption.price, // DB에서 조회한 가격 사용
        quantity: clientOption.quantity || 1
      };
    });

    // 총 금액 검증
    const calculatedTotalAmount = validatedOptions.reduce(
      (sum: number, option: any) => sum + (option.price * option.quantity),
      0
    );

    if (calculatedTotalAmount !== totalAmount) {
      return NextResponse.json(
        { error: "총 금액이 일치하지 않습니다." }, 
        { status: 400 }
      );
    }

    // 주문번호 생성 (현재 날짜 + 랜덤 숫자)
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const orderNumber = `${dateStr}-${randomStr}`;

    // Order 생성
    const order = await db.order.create({
      data: {
        orderNumber,
        totalAmount: calculatedTotalAmount, // 계산된 금액 사용
        depositorName,
        status: OrderStatus.PENDING_PAYMENT,
        isPaid: false,
        
        // 연관 관계
        userId,
        productId: product.id,
        
        // 배송지 정보 (스냅샷)
        dName: selectedAddress.name,
        dPhone: selectedAddress.phone,
        dZipCode: selectedAddress.zipCode || "",
        dAddress: selectedAddress.address,
        dDetailAddress: selectedAddress.detailAddress || "",
        dMemo: selectedAddress.memo || "",
        
        // 판매자 계좌 정보 (스냅샷)
        bankType: seller.bankType,
        accountNumber: seller.accountNumber,
        accountHolder: seller.accountHolder,
        
        // 주문 옵션 정보 (검증된 옵션 사용)
        orderOptions: {
          create: validatedOptions.map((option: any) => ({
            quantity: option.quantity,
            price: option.price,
            optionTitle: option.title,
            productOptionId: option.id
          }))
        }
      },
      include: {
        orderOptions: true
      }
    });

    return NextResponse.json(order, { status: 201 });
    
  } catch (error: any) {
    console.error("주문 생성 오류:", error);
    return NextResponse.json(
      { error: "주문 처리 중 오류가 발생했습니다: " + error.message }, 
      { status: 500 }
    );
  }
} 