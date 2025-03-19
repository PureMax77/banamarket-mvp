import { NextResponse } from 'next/server';
import getSession from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    
    return NextResponse.json({
      isAuthenticated: !!session.id,
      userId: session.id || null
    });
  } catch (error) {
    console.error('세션 확인 중 오류 발생:', error);
    return NextResponse.json(
      { isAuthenticated: false, error: '세션 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 