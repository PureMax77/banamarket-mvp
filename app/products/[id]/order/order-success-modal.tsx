"use client"

import { ChevronLeft, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { BANK_CODES } from "@/types/common"

interface OrderSuccessModalProps {
  onClose: () => void
  totalAmount: number
  depositorName: string
  accountInfo: {
    bankType: string;
    accountNumber: string;
    accountHolder: string;
  }
}

export default function OrderSuccessModal({ 
  onClose,
  totalAmount,
  depositorName,
  accountInfo
}: OrderSuccessModalProps) {
  const { toast } = useToast()
  const [isCopied, setIsCopied] = useState(false)
  
  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(accountInfo.accountNumber)
      setIsCopied(true)
      
      toast({
        title: "계좌번호가 복사되었습니다.",
      })
      
      // 3초 후 복사 상태 초기화
      setTimeout(() => {
        setIsCopied(false)
      }, 3000)
    } catch (error) {
      console.error("클립보드 복사 오류:", error)
      toast({
        variant: "destructive",
        title: "계좌번호 복사 실패",
        description: "계좌번호 복사 중 오류가 발생했습니다.",
      })
    }
  }

  return (
    <div className="m-screen-set fixed inset-0 bg-white flex flex-col h-full" style={{"marginTop": "0px"}}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b">
        <button onClick={onClose} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-medium">주문 신청 성공!</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col items-center justify-center space-y-8 mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">주문이 신청되었습니다</h2>
            <p className="text-gray-600">
              아래 계좌로 입금해야 주문이 완료됩니다!
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg mb-8">
          <h3 className="font-medium mb-4">입금 정보</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">입금 금액</span>
              <span className="font-bold">{totalAmount.toLocaleString()}원</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">은행명</span>
              <span>
                {Object.entries(BANK_CODES).find(([_, code]) => code === accountInfo.bankType)?.[0] || accountInfo.bankType}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">예금주</span>
              <span>{accountInfo.accountHolder}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">계좌번호</span>
              <div className="flex items-center space-x-2">
                <span>{accountInfo.accountNumber}</span>
                <button 
                  onClick={handleCopyAccount}
                  className="p-1 rounded-md hover:bg-gray-200"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-gray-600">입금자명</span>
              <span className="font-medium">{depositorName}</span>
            </div>
          </div>
        </div>
        
        {/* <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-amber-800 text-sm">
            <span className="font-medium">입금 안내:</span> 주문 후 24시간 이내에 입금해주셔야 주문이 확정됩니다. 
            입금자명은 실제 입금하시는 분의 이름과 동일하게 입력해주세요.
          </p>
        </div> */}
      </div>

      {/* Button */}
      <div className="p-4">
        <Button
          onClick={onClose}
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-lg"
        >
          확인
        </Button>
      </div>

      {/* Bottom indicator */}
      <div className="flex justify-center pb-2 pt-1">
        <div className="w-32 h-1.5 bg-gray-800 rounded-full"></div>
      </div>
    </div>
  )
} 