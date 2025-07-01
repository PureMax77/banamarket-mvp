import { EllipsisVertical, Share } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import FinishModal from "@/components/modal/finish-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

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

interface SaleCardProps {
  product: Product;
  onFinishSale: (productId: number) => Promise<void>;
  isDownloadMode?: boolean;
  isSelected?: boolean;
  onSelect?: (productId: number, isSelected: boolean) => void;
}

export default function SaleCard({
  product,
  onFinishSale,
  isDownloadMode = false,
  isSelected = false,
  onSelect
}: SaleCardProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 주문 건수 계산
  const orderCount = product.orders.length;

  // 총 주문 금액 계산
  const totalOrderAmount = product.orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);

  // 날짜 포맷팅
  const startDateFormatted = format(new Date(product.startDate), 'yyyy.MM.dd');
  const endDateFormatted = product.endDate
    ? format(new Date(product.endDate), 'yyyy.MM.dd')
    : '무기한';

  const handleShare = async () => {
    // 현재 도메인 + products/[id] 형태의 URL 생성
    const shareUrl = `${window.location.origin}/products/${product.id}`;

    // Navigator.share API가 지원되는지 확인
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `${product.title} 상품을 확인해보세요!`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('공유하기에 실패했습니다:', error);
        toast({
          title: '공유하기에 실패했습니다',
          description: '다시 시도해주세요',
          variant: 'destructive',
        });
      }
    } else {
      // share API를 지원하지 않는 브라우저를 위한 대체 기능
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: '링크가 복사되었습니다',
          description: '원하는 곳에 붙여넣기 하세요',
        });
      } catch (error) {
        console.error('클립보드 복사에 실패했습니다:', error);
        toast({
          title: '링크 복사에 실패했습니다',
          description: '다시 시도해주세요',
          variant: 'destructive',
        });
      }
    }
  };

  const confirmFinishSale = async () => {
    try {
      await onFinishSale(product.id);
      toast({
        title: "판매완료 처리 되었습니다",
        description: "판매가 완료되었습니다",
      });
    } catch (error) {
      console.error('판매완료 처리 중 오류가 발생했습니다:', error);
      toast({
        title: '판매완료 처리에 실패했습니다',
        description: '다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setOpen(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(product.id, checked);
    }
  };

  const handleOrderDetails = () => {
    router.push(`/biz/list/${product.id}`);
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-5 relative">
        {isDownloadMode && (
          <div className="absolute top-3 left-5">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
            />
          </div>
        )}
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span>{product.title}</span>
            <span>{startDateFormatted} ~ {endDateFormatted}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-right">총 {orderCount}건 주문</span>
            <span className="text-right">총 주문금액 {totalOrderAmount.toLocaleString()}원</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button className="px-2" onClick={handleShare}>
              <Share className="w-4 h-4" />
              공유
            </Button>
            <Button className="px-2" onClick={handleOrderDetails}>주문내역</Button>
            {!product.endDate && (
              <FinishModal
                open={open}
                onOpenChange={setOpen}
                onConfirm={confirmFinishSale}
              />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>수정 요청하기</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
} 