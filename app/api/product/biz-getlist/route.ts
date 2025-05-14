import { NextResponse } from 'next/server';
import getSession from '@/lib/session';
import db from '@/lib/db';
import { Farm, Product } from '@prisma/client';

export async function GET() {
  try {
    // 세션에서 사용자 ID 가져오기
    const session = await getSession();
    
    if (!session.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 사용자 정보 가져오기
    const user = await db.user.findUnique({
      where: { id: session.id },
      include: {
        farms: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    if (!user.isSeller) {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      );
    }
    
    // 사용자의 농장 ID들 추출
    const farmIds = user.farms.map((farm: Farm) => farm.id);
    
    if (farmIds.length === 0) {
      return NextResponse.json({ products: [] });
    }
    
    // 현재 시간
    const now = new Date();
    
    // 해당 농장들의 모든 상품 가져오기
    const products = await db.product.findMany({
      where: {
        farmId: {
          in: farmIds
        }
      },
      include: {
        options: true,
        orders: {
          include: {
            orderOptions: true
          }
        }
      }
    });
    
    // 판매중, 판매완료 상품으로 분류
    const activeProducts = products.filter((product: Product) => {
      const start = new Date(product.startDate);
      const end = product.endDate ? new Date(product.endDate) : null;
      
      return start <= now && (!end || end >= now);
    });
    
    const completedProducts = products.filter((product: Product) => {
      const start = new Date(product.startDate);
      const end = product.endDate ? new Date(product.endDate) : null;
      
      return start > now || (end && end < now);
    });
    
    return NextResponse.json({
      active: activeProducts,
      completed: completedProducts
    });
  } catch (error) {
    console.error('상품 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '상품 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 