"use client";

import { useState } from "react";
import { EllipsisVertical, Share } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DownloadButton from "@/components/button/DownloadButton";

enum TabType {
  ING = "ing",
  COMPLETE = "complete",
}

export default function BizList() {
  const [selectedTab, setSelectedTab] = useState<TabType>(TabType.ING);

  return (
    <div className="min-h-screen bg-yellow-100 bg-opacity-50 px-4 py-6">
      <div className="flex flex-col gap-5">
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as TabType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TabType.ING}>판매 중</TabsTrigger>
            <TabsTrigger value={TabType.COMPLETE}>판매 완료</TabsTrigger>
          </TabsList>
          <TabsContent value={TabType.ING}>
            <SaleCard />
          </TabsContent>
          <TabsContent value={TabType.COMPLETE}>
            <SaleCard />
          </TabsContent>
        </Tabs>
      </div>
      <DownloadButton />
    </div>
  );
}

function SaleCard() {
  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span>판매 상품 이름</span>
            <span>총 3건 주문</span>
          </div>
          <div className="flex justify-between">
            <span>2024.09.10 ~ 2024.10.24</span>
            <span>총 주문금액 0원</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-5">
            <Button className="w-28">
              <Share className="w-4 h-4 mr-2" />
              공유하기
            </Button>
            <Button className="w-28">주문내역 확인</Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
