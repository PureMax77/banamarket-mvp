import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const productId = parseInt(params.id);

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: "유효하지 않은 상품 ID입니다." },
                { status: 400 }
            );
        }

        // 상품 정보와 관련 주문을 함께 조회
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                options: true,
                orders: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                            },
                        },
                        orderOptions: {
                            include: {
                                productOption: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "상품을 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        // 주문 데이터 가공
        const processedOrders = product.orders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            isInvoiceDownloaded: order.isInvoiceDownloaded,
            created_at: order.created_at.toISOString(),
            user: {
                id: order.user.id,
                username: order.user.username,
                name: order.user.name,
            },
            orderOptions: order.orderOptions.map((option) => ({
                id: option.id,
                quantity: option.quantity,
                price: option.price,
                optionTitle: option.optionTitle,
                productOptionId: option.productOptionId,
            })),
        }));

        // 응답 데이터 구성
        const response = {
            id: product.id,
            title: product.title,
            photo: product.photo,
            description: product.description,
            startDate: product.startDate.toISOString(),
            endDate: product.endDate ? product.endDate.toISOString() : null,
            options: product.options,
            orders: processedOrders,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("상품 주문 내역 조회 중 오류:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 