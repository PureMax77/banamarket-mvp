"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons
import { TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { CubeIcon } from "@heroicons/react/24/outline";

// Order status mapping for display
const ORDER_STATUS_MAP = {
  [OrderStatus.PENDING_PAYMENT]: {
    label: "입금 대기",
    icon: <ClockIcon className="w-5 h-5 text-amber-500" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  [OrderStatus.PREPARING]: {
    label: "상품 준비중",
    icon: <CubeIcon className="w-5 h-5 text-blue-500" />,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  [OrderStatus.SHIPPING]: {
    label: "배송중",
    icon: <TruckIcon className="w-5 h-5 text-indigo-500" />,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  [OrderStatus.DELIVERED]: {
    label: "배송 완료",
    icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  [OrderStatus.CANCELED]: {
    label: "주문 취소",
    icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  [OrderStatus.REFUNDED]: {
    label: "환불 완료",
    icon: <ArrowPathIcon className="w-5 h-5 text-gray-500" />,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
};

// Order type definition
type OrderOption = {
  id: number;
  quantity: number;
  price: number;
  optionTitle: string;
  productOption: {
    id: number;
    title: string;
    price: number;
  };
};

type Order = {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  depositorName: string;
  isPaid: boolean;
  created_at: string;
  updated_at: string;
  dName: string;
  dPhone: string;
  dZipCode: string;
  dAddress: string;
  dDetailAddress: string;
  dMemo?: string;
  product: {
    title: string;
    photo: string[];
  };
  orderOptions: OrderOption[];
};

export default function OrderSearchClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("all");
  const [currentYear, setCurrentYear] = useState<string>(new Date().getFullYear().toString());
  const [error, setError] = useState<string | null>(null);

  // Fetch orders based on selected status and year
  const fetchOrders = async (status?: OrderStatus, year?: string) => {
    setLoading(true);
    try {
      let url = "/api/ordersearch";
      const params = new URLSearchParams();

      if (status) {
        params.append("status", status);
      }

      if (year && year !== "all") {
        params.append("year", year);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("주문 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("주문 목록 조회 에러:", err);
      setError("주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with current year as default
    fetchOrders(undefined, currentYear);
  }, []);

  // Handle status change
  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
    if (value === "all") {
      fetchOrders(undefined, currentYear);
    } else {
      fetchOrders(value as OrderStatus, currentYear);
    }
  };

  // Handle year change
  const handleYearChange = (value: string) => {
    setCurrentYear(value);
    if (currentStatus === "all") {
      fetchOrders(undefined, value);
    } else {
      fetchOrders(currentStatus as OrderStatus, value);
    }
  };

  // Get available years for filter
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [
      { value: currentYear.toString(), label: `${currentYear}년` },
      { value: (currentYear - 1).toString(), label: `${currentYear - 1}년` },
      { value: (currentYear - 2).toString(), label: `${currentYear - 2}년` },
    ];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 MM월 dd일", { locale: ko });
  };

  // Get tracking URL (placeholder - would need to be implemented with actual delivery service)
  const getTrackingUrl = (orderNumber: string) => {
    // This is a placeholder. In a real app, you would use the actual tracking URL from your delivery service
    return `https://tracker.delivery/#/${orderNumber}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchOrders()}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* 고정된 헤더 */}
      <header className="fixed m-screen-set top-0 h-16 bg-white p-4 z-10 flex justify-between items-center border-neutral-200 border-b w-full">
        <h1 className="text-lg font-bold text-center">주문목록 / 배송조회</h1>
      </header>

      {/* 스크롤 가능한 콘텐츠 */}
      <main className="pt-16 pb-20 px-4">
        <div className="flex justify-between items-center mb-6 mt-4">
          <div className="w-1/2">
            <Select defaultValue="all" onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="주문 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value={OrderStatus.PENDING_PAYMENT}>입금대기</SelectItem>
                <SelectItem value={OrderStatus.PREPARING}>상품 준비중</SelectItem>
                <SelectItem value={OrderStatus.SHIPPING}>배송중</SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>배송완료</SelectItem>
                <SelectItem value={OrderStatus.CANCELED}>주문취소</SelectItem>
                <SelectItem value={OrderStatus.REFUNDED}>환불완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/3">
            <Select defaultValue={new Date().getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="연도" />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>주문 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-gray-50 flex flex-row justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">주문번호: {order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP].bgColor} ${ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP].color} flex items-center gap-1`}>
                      {ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP].icon}
                      <span className="text-sm font-medium">{ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP].label}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative size-20 min-w-20 rounded-md overflow-hidden">
                        {order.product.photo && order.product.photo.length > 0 ? (
                          <Image
                            src={`${order.product.photo[0]}/avatar`}
                            alt={order.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <CubeIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{order.product.title}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          {order.orderOptions.map((option) => (
                            <div key={option.id} className="flex justify-between">
                              <span>{option.optionTitle}</span>
                              <span>{option.quantity}개</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 font-bold">{order.totalAmount.toLocaleString()}원</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">배송지</span>
                        <span>{order.dAddress} {order.dDetailAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">수령인</span>
                        <span>{order.dName} ({order.dPhone})</span>
                      </div>
                      {order.dMemo && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">배송메모</span>
                          <span>{order.dMemo}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-gray-50 flex justify-between">
                    {(order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED) && (
                      <Link
                        href={getTrackingUrl(order.orderNumber)}
                        target="_blank"
                        className="text-blue-500 text-sm flex items-center"
                      >
                        <TruckIcon className="w-4 h-4 mr-1" />
                        배송조회
                      </Link>
                    )}
                    {order.status === OrderStatus.PENDING_PAYMENT && (
                      <div className="text-amber-500 text-sm flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        입금 확인 중
                      </div>
                    )}
                    {order.status === OrderStatus.PREPARING && (
                      <div className="text-blue-500 text-sm flex items-center">
                        <CubeIcon className="w-4 h-4 mr-1" />
                        상품 준비 중
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      // onClick={() => router.push(`/order/${order.id}`)}
                      onClick={() => alert("준비중입니다.")}
                    >
                      주문 상세
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main >
    </div >
  );
}
