"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductOptionPopup } from "./option-popup";
import { ProductType } from "./page";
import PreviewCarousel from "@/components/carousel/preview-carousel";
import HeaderWithTitle from "@/components/BackHeader";

interface ProductDetailClientProps {
  product: ProductType;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();

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

  const getMinPrice = () => {
    if (!product.options || product.options.length === 0) return 0;
    return Math.min(...product.options.map(option => option.price));
  };

  const getPhotosWithPublic = () => {
    return product.photo.map(url => `${url}/public`);
  };

  return (
    <div className="container flex flex-col">
      {/* Header */}
      <HeaderWithTitle title="상품 정보" />

      <div className="w-full flex-1 flex flex-col justify-between p-6 space-y-6">
        <PreviewCarousel preview={getPhotosWithPublic()} />

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-semibold">{product.title}</h1>
            <span className="text-2xl font-bold text-green-700">
              {formatPrice(getMinPrice())}
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">판매 기간</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {formatDate(product.startDate.toString())} ~{" "}
                {product.endDate ? formatDate(product.endDate.toString()) : "미정"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">상품 설명</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-line">
                {product.description}
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
      </div>

      <ProductOptionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        productOptions={product.options}
        productId={product.id + ""}
      />
    </div>
  );
} 