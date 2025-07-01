import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 현재 시간을 endDate로 설정하여 상품을 판매 완료 처리
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { endDate: new Date() },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    });
  } catch (error) {
    console.error('판매완료 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '판매완료 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
} 