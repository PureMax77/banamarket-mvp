"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ProductOption {
  id: number;
  title: string;
  price: number;
  discount: number;
  created_at: Date;
  updated_at: Date;
  productId: number;
}

interface SelectedOption extends ProductOption {
  quantity: number;
}

interface ProductOptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productOptions: ProductOption[];
  productId: string;
}

export function ProductOptionPopup({
  isOpen,
  onClose,
  productOptions,
  productId,
}: ProductOptionPopupProps) {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const router = useRouter();
  const { toast, dismiss } = useToast();

  const handleOptionSelect = (optionId: string) => {
    const selectedOption = productOptions.find(
      (option) => option.id.toString() === optionId
    );
    if (selectedOption) {
      const existingOption = selectedOptions.find((item) => item.id.toString() === optionId);
      if (existingOption) {
        setSelectedOptions((prev) =>
          prev.map((item) =>
            item.id.toString() === optionId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setSelectedOptions((prev) => [...prev, { ...selectedOption, quantity: 1 }]);
      }
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    setSelectedOptions((prev) =>
      prev
        .map((item) =>
          item.id.toString() === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleDeleteOption = (id: string) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id.toString() !== id));
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  const { totalItems, totalPrice } = useMemo(() => {
    return selectedOptions.reduce(
      (acc, option) => {
        acc.totalItems += option.quantity;
        acc.totalPrice += option.price * option.quantity;
        return acc;
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }, [selectedOptions]);

  const redirectToLogin = () => {
    // 모든 토스트 닫기
    dismiss();
    // 로그인 페이지로 이동 및 팝업 닫기
    router.push("/login");
    onClose();
  };

  const handlePurchase = async () => {
    try {
      // API를 통해 세션 확인
      const response = await fetch('/api/auth/check-session');
      const data = await response.json();
      
      if (!data.isAuthenticated) {
        // 세션이 없으면 로그인 토스트 표시
        toast({
          title: "로그인이 필요합니다",
          description: "구매하기 전에 로그인해주세요.",
          variant: "destructive",
          duration: 10000, // 10초 후 사라짐 (10000ms)
          action: (
            <Button 
              variant="outline" 
              onClick={redirectToLogin}
              className="bg-red-300 hover:bg-red-500"
            >
              로그인
            </Button>
          ),
        });
        return;
      }
      
      // 세션이 있으면 주문 페이지로 이동
      const simplifiedOptions = selectedOptions.map(option => ({
        id: option.id,
        quantity: option.quantity
      }));
      const optionsParam = encodeURIComponent(JSON.stringify(simplifiedOptions));
      router.push(`/products/${productId}/order?options=${optionsParam}`);
      onClose();
    } catch (error) {
      console.error("세션 확인 중 오류 발생:", error);
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 10000, // 10초 후 사라짐 (10000ms)
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="m-screen-set h-[80vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>상품 옵션 선택</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow py-4">
          <div className="space-y-4">
            <Select onValueChange={handleOptionSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="옵션을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.title} - {formatPrice(option.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedOptions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">선택된 옵션</h3>
              {selectedOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between"
                >
                  <span>
                    {option.title} - {formatPrice(option.price)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(option.id.toString(), -1)}
                    >
                      -
                    </Button>
                    <span>{option.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(option.id.toString(), 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOption(option.id.toString())}
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <SheetFooter className="flex-shrink-0">
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">총 {totalItems}개 상품</span>
              <span className="font-bold text-lg">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              className="w-full bg-[#a7d1fa] hover:bg-[#8bc1fa] text-black"
              size="lg"
              onClick={handlePurchase}
              disabled={totalItems === 0}
            >
              구매하기
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
