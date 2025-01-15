"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductOptionPopup } from "./option-popup";

interface ProductData {
  id: string;
  title: string;
  description: string;
  saleStartDate: string;
  saleEndDate: string;
  price: number;
  options: ProductOption[];
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

// 실제로는 API나 데이터베이스에서 가져올 데이터
const productData: ProductData = {
  id: "1",
  title: "신선한 배",
  description: "맛있는 배가 있어요. 당도가 높고 신선한 상태로 배송해드립니다.",
  saleStartDate: "2025-01-15",
  saleEndDate: "2025-01-31",
  price: 25000,
  options: [
    { id: "1", name: "일반 배", price: 25000 },
    { id: "2", name: "선물용 배", price: 30000 },
    { id: "3", name: "유기농 배", price: 35000 },
  ],
};

export default function ProductDetail() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="bg-[#fffff5]">
        <CardContent className="p-6 space-y-6">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Image
              src="https://imagedelivery.net/S5EmZfh9mNC3-3xmENYiiA/6b89c232-31ae-46ac-fd71-4cca4607ba00/public"
              alt="신선한 배"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-semibold">{productData.title}</h1>
              <span className="text-2xl font-bold text-green-700">
                {formatPrice(productData.price)}
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">판매 기간</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {formatDate(productData.saleStartDate)} ~{" "}
                  {formatDate(productData.saleEndDate)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">상품 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line">
                  {productData.description}
                </p>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-[#a7d1fa] hover:bg-[#8bc1fa] text-black mt-4"
              size="lg"
              onClick={() => setIsPopupOpen(true)}
            >
              구매하기
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductOptionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        productOptions={productData.options}
      />
    </div>
  );
}
