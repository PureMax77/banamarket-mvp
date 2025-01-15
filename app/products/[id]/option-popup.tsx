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

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface SelectedOption extends ProductOption {
  quantity: number;
}

interface ProductOptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productOptions: ProductOption[];
}

export function ProductOptionPopup({
  isOpen,
  onClose,
  productOptions,
}: ProductOptionPopupProps) {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  const handleOptionSelect = (optionId: string) => {
    const selectedOption = productOptions.find(
      (option) => option.id === optionId
    );
    if (selectedOption) {
      setSelectedOptions((prev) => {
        const existingOption = prev.find((item) => item.id === optionId);
        if (existingOption) {
          return prev.map((item) =>
            item.id === optionId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...selectedOption, quantity: 1 }];
      });
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    setSelectedOptions((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleDeleteOption = (id: string) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== id));
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

  const handlePurchase = () => {
    // Implement purchase logic here
    console.log("Purchasing:", selectedOptions);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
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
                  <SelectItem key={option.id} value={option.id}>
                    {option.name} - {formatPrice(option.price)}
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
                    {option.name} - {formatPrice(option.price)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(option.id, -1)}
                    >
                      -
                    </Button>
                    <span>{option.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(option.id, 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOption(option.id)}
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
