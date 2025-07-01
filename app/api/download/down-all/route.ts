import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import * as XLSX from 'xlsx';
import { ORDER_STATUS_KOREAN } from '@/lib/constants';

export async function POST(request: NextRequest) {
    try {
        const { productIds, downloadType } = await request.json();

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json(
                { error: '상품 ID 목록이 필요합니다.' },
                { status: 400 }
            );
        }

        // 다운로드 타입에 따른 조건 설정
        const whereCondition: any = {
            productId: {
                in: productIds.map((id: any) => parseInt(id))
            }
        };

        // 미다운 다운인 경우 isInvoiceDownloaded가 false인 주문만 조회
        if (downloadType === 'notDownloaded') {
            whereCondition.isInvoiceDownloaded = false;
        }

        // 해당 상품들의 주문 조회
        const orders = await db.order.findMany({
            where: whereCondition,
            include: {
                user: true,
                product: true,
                orderOptions: {
                    include: {
                        productOption: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        if (orders.length === 0) {
            const errorMessage = downloadType === 'notDownloaded'
                ? '미다운로드 주문이 없습니다.'
                : '다운로드할 주문이 없습니다.';
            return NextResponse.json(
                { error: errorMessage },
                { status: 404 }
            );
        }

        // 엑셀 데이터 준비
        const excelData = orders.map((order: any, index: number) => ({
            '상품명': order.product.title,
            '주문번호': order.orderNumber,
            '총 주문금액': order.totalAmount,
            '입금자명': order.depositorName,
            '주문자명': order.dName,
            '받는분 연락처': order.dPhone,
            '우편번호': order.dZipCode,
            '주소': order.dAddress,
            '상세주소': order.dDetailAddress,
            '배송메모': order.dMemo || '',
            '주문일': order.created_at.toISOString().split('T')[0], // YYYY-MM-DD 형식
            '주문상태': ORDER_STATUS_KOREAN[order.status as keyof typeof ORDER_STATUS_KOREAN] || order.status
        }));

        // 워크북과 워크시트 생성
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 컬럼 너비 설정
        const columnWidths = [
            { wch: 20 }, // 상품명
            { wch: 20 }, // 주문번호
            { wch: 15 }, // 총 주문금액
            { wch: 12 }, // 입금자명
            { wch: 12 }, // 주문자명
            { wch: 15 }, // 받는분 연락처
            { wch: 10 }, // 우편번호
            { wch: 30 }, // 주소
            { wch: 20 }, // 상세주소
            { wch: 20 }, // 배송메모
            { wch: 12 }, // 주문일
            { wch: 12 }  // 주문상태
        ];
        worksheet['!cols'] = columnWidths;

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(workbook, worksheet, '주문내역');

        // 엑셀 파일을 버퍼로 생성
        const excelBuffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx'
        });

        // 실제로 다운로드된 주문들의 ID 추출
        const orderIds = orders.map(order => order.id);

        // 다운로드된 주문들의 isInvoiceDownloaded를 true로 업데이트
        await db.order.updateMany({
            where: {
                id: {
                    in: orderIds
                }
            },
            data: {
                isInvoiceDownloaded: true
            }
        });

        // 현재 날짜를 파일명에 포함
        const currentDate = new Date().toISOString().split('T')[0];
        const downloadTypeText = downloadType === 'notDownloaded' ? '미다운' : '전체';
        const fileName = `주문내역_${downloadTypeText}_일괄다운_${currentDate}.xlsx`;

        // 응답 헤더 설정
        const response = new NextResponse(excelBuffer);
        response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

        return response;

    } catch (error) {
        console.error('Excel download error:', error);
        return NextResponse.json(
            { error: '엑셀 다운로드 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
