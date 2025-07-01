"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DownloadButton from "@/components/button/DownloadButton";
import SaleCard from "./_components/sale-card";

enum TabType {
  ING = "ing",
  COMPLETE = "complete",
}

enum SortType {
  END_DATE_DESC = "end_date_desc",
  END_DATE_ASC = "end_date_asc",
  START_DATE_DESC = "start_date_desc",
  START_DATE_ASC = "start_date_asc",
}

interface ProductOption {
  id: number;
  title: string;
  price: number;
  discount: number;
}

interface Order {
  id: number;
  totalAmount: number;
}

interface Product {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  options: ProductOption[];
  orders: Order[];
}

export default function BizList() {
  const [selectedTab, setSelectedTab] = useState<TabType>(TabType.ING);
  const [sortType, setSortType] = useState<SortType>(SortType.END_DATE_DESC);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [completedProducts, setCompletedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMode, setIsDownloadMode] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/product/biz-getlist');

      if (!response.ok) {
        throw new Error('상품 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setActiveProducts(data.active || []);
      setCompletedProducts(data.completed || []);
    } catch (err) {
      setError('상품 목록을 불러오는데 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFinishSale = async (productId: number) => {
    try {
      const response = await fetch('/api/product/set-finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('판매완료 처리에 실패했습니다.');
      }

      // 상품 목록 새로고침
      await fetchProducts();

      // 판매 완료 탭으로 전환
      setSelectedTab(TabType.COMPLETE);
    } catch (err) {
      console.error('판매완료 처리 중 오류:', err);
      alert('판매완료 처리에 실패했습니다.');
    }
  };

  const handleDownloadModeChange = (mode: boolean) => {
    setIsDownloadMode(mode);
    // 다운로드 모드를 해제할 때 선택된 상품 초기화
    if (!mode) {
      setSelectedProducts([]);
    }
  };

  const handleSelectAll = () => {
    const currentProducts = selectedTab === TabType.ING ? activeProducts : completedProducts;

    if (selectedProducts.length === currentProducts.length) {
      // 이미 모두 선택되어 있으면 모두 해제
      setSelectedProducts([]);
    } else {
      // 아니면 모두 선택
      setSelectedProducts(currentProducts.map(product => product.id));
    }
  };

  const handleProductSelect = (productId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const sortedActiveProducts = useMemo(() => {
    return [...activeProducts].sort((a, b) => {
      switch (sortType) {
        case SortType.END_DATE_DESC:
          // endDate가 없는 상품이 가장 최신으로 간주
          if (a.endDate === null && b.endDate === null) {
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          }
          if (a.endDate === null) return -1;
          if (b.endDate === null) return 1;
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();

        case SortType.END_DATE_ASC:
          // endDate가 없는 상품이 가장 오래된 것으로 간주
          if (a.endDate === null && b.endDate === null) {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          }
          if (a.endDate === null) return 1;
          if (b.endDate === null) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();

        case SortType.START_DATE_DESC:
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();

        case SortType.START_DATE_ASC:
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

        default:
          return 0;
      }
    });
  }, [activeProducts, sortType]);

  const sortedCompletedProducts = useMemo(() => {
    return [...completedProducts].sort((a, b) => {
      switch (sortType) {
        case SortType.END_DATE_DESC:
          // endDate가 없는 상품이 가장 최신으로 간주
          if (a.endDate === null && b.endDate === null) {
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          }
          if (a.endDate === null) return -1;
          if (b.endDate === null) return 1;
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();

        case SortType.END_DATE_ASC:
          // endDate가 없는 상품이 가장 오래된 것으로 간주
          if (a.endDate === null && b.endDate === null) {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          }
          if (a.endDate === null) return 1;
          if (b.endDate === null) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();

        case SortType.START_DATE_DESC:
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();

        case SortType.START_DATE_ASC:
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

        default:
          return 0;
      }
    });
  }, [completedProducts, sortType]);

  return (
    <div className="min-h-screen bg-yellow-100 bg-opacity-50 px-4 py-6 relative">
      <div className="flex flex-col gap-5">
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as TabType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TabType.ING}>판매 중</TabsTrigger>
            <TabsTrigger value={TabType.COMPLETE}>판매 완료</TabsTrigger>
          </TabsList>
          <div className="flex flex-col mt-3 mb-3 gap-3" >
            {selectedTab === TabType.ING && (
              <div className="mr-auto">
                <DownloadButton
                  isDownloadMode={isDownloadMode}
                  onDownloadModeChange={handleDownloadModeChange}
                  onSelectAll={handleSelectAll}
                  selectedProducts={selectedProducts}
                />
              </div>
            )}
            <Select
              value={sortType}
              onValueChange={(value) => setSortType(value as SortType)}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="정렬 방식 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SortType.END_DATE_DESC}>판매완료 늦은 순</SelectItem>
                <SelectItem value={SortType.END_DATE_ASC}>판매완료 빠른 순</SelectItem>
                <SelectItem value={SortType.START_DATE_DESC}>판매시작 늦은 순</SelectItem>
                <SelectItem value={SortType.START_DATE_ASC}>판매시작 빠른 순</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsContent value={TabType.ING}>
            {isLoading ? (
              <div className="text-center py-10">상품 목록을 불러오는 중...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : sortedActiveProducts.length === 0 ? (
              <div className="text-center py-10">판매 중인 상품이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {sortedActiveProducts.map((product) => (
                  <SaleCard
                    key={product.id}
                    product={product}
                    onFinishSale={handleFinishSale}
                    isDownloadMode={isDownloadMode}
                    isSelected={selectedProducts.includes(product.id)}
                    onSelect={handleProductSelect}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value={TabType.COMPLETE}>
            {isLoading ? (
              <div className="text-center py-10">상품 목록을 불러오는 중...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : sortedCompletedProducts.length === 0 ? (
              <div className="text-center py-10">판매 완료된 상품이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {sortedCompletedProducts.map((product) => (
                  <SaleCard
                    key={product.id}
                    product={product}
                    onFinishSale={handleFinishSale}
                    isDownloadMode={isDownloadMode}
                    isSelected={selectedProducts.includes(product.id)}
                    onSelect={handleProductSelect}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}



