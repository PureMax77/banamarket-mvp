"use client";

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { OrderOptionType, OrderProductType } from "./page";
import { useState, useEffect } from "react";
import AddressListModal from "./address-list-modal";
import AddressFormModal from "./address-form-modal";
import { User } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import OrderSuccessModal from "./order-success-modal";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"
import { PATH_NAME } from "@/lib/constants";

interface OrderClientProps {
  product: OrderProductType;
  selectedOptions: OrderOptionType;
  user: User & { addresses: any[] };
}

export default function OrderClient({ product, selectedOptions, user }: OrderClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [addresses, setAddresses] = useState(user.addresses)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [depositorName, setDepositorName] = useState("")
  const [orderAccountInfo, setOrderAccountInfo] = useState<{
    bankType: string;
    accountNumber: string;
    accountHolder: string;
  } | null>(null)
  
  const handleGoBack = () => {
    router.back();
  }

  // 기본 배송지 또는 첫 번째 배송지를 기본값으로 설정
  const defaultAddress = addresses.length > 0 ? addresses[0] : null;
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);

  // API 호출 후 주소 목록을 새로 불러오는 함수
  const refreshAddresses = async () => {
    try {
      const response = await fetch('/api/address/list');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        
        // 선택된 주소가 있는지 확인하고 업데이트
        if (selectedAddress) {
          const updatedSelectedAddress = data.find((addr: any) => addr.id === selectedAddress.id);
          if (!updatedSelectedAddress) {
            // 선택된 주소가 삭제된 경우 기본 주소로 변경
            setSelectedAddress(data.length > 0 ? data[0] : null);
          } else {
            // 주소가 있으면 업데이트된 정보로 갱신
            setSelectedAddress(updatedSelectedAddress);
          }
        }
      }
    } catch (error) {
      console.error('주소 목록 불러오기 실패:', error);
    }
  };

  const handleAddAddress = () => {
    setShowAddressForm(true)
    setEditingAddress(null)
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address)
    setShowAddressForm(true)
  }

  const handleSaveAddress = (address: any) => {
    // 새로운 주소가 API를 통해 저장된 후 반환된 데이터 처리
    if (address) {
      console.log('주소 저장/수정 성공:', { 
        addressId: address.id, 
        isUpdate: addresses.some(addr => addr.id === address.id),
        editingAddress: editingAddress?.id
      });
      
      // 주소 목록 업데이트 (기존 목록에 없는 주소인 경우 추가)
      if (!addresses.some(addr => addr.id === address.id)) {
        // 새 주소인 경우
        console.log('새 주소 추가:', address);
        
        // 새 주소가 기본 배송지인 경우 다른 주소의 기본 배송지 상태 제거
        const updatedAddresses = addresses.map(addr => {
          return address.isDefault && addr.isDefault 
            ? { ...addr, isDefault: false } 
            : addr;
        });
        setAddresses([address, ...updatedAddresses]);
      } else {
        // 기존 주소 업데이트
        console.log('기존 주소 수정:', address);
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => addr.id === address.id ? address : addr)
        );
      }
      
      // 새로 저장하거나 수정한 주소를 선택된 주소로 설정
      setSelectedAddress(address);
    }
    
    // 주소 입력 폼 닫기
    setShowAddressForm(false);
    // 편집 상태 초기화
    setEditingAddress(null);
  }

  // 주소 삭제 처리 함수
  const handleDeleteAddress = (deletedAddressId: string | number) => {
    console.log('주소 삭제 처리:', deletedAddressId);
    
    // 주소 목록에서 삭제된 주소 제거
    setAddresses(prevAddresses => 
      prevAddresses.filter(addr => addr.id !== deletedAddressId)
    );
    
    // 삭제된 주소가 현재 선택된 주소인 경우 선택 변경
    if (selectedAddress && selectedAddress.id === deletedAddressId) {
      const remainingAddresses = addresses.filter(addr => addr.id !== deletedAddressId);
      setSelectedAddress(remainingAddresses.length > 0 ? remainingAddresses[0] : null);
    }
  };

  // 기본 배송지로 설정하는 함수
  const handleSetDefaultAddress = async (addressId: string | number) => {
    if (!addressId || isSettingDefault) return;
    
    try {
      setIsSettingDefault(true);
      
      const response = await fetch(`/api/address/set-default/${addressId}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기본 배송지 설정에 실패했습니다.');
      }
      
      // 서버에서 최신 주소 목록 가져오기
      await refreshAddresses();
      
      toast({
        title: "기본 배송지로 설정되었습니다.",
      });
      
    } catch (error) {
      console.error('기본 배송지 설정 오류:', error);
      toast({
        variant: "destructive",
        title: "기본 배송지 설정 오류",
        description: error instanceof Error ? error.message : '기본 배송지 설정 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  // 기본 배송지 해제 함수
  const handleUnsetDefaultAddress = async (addressId: string | number) => {
    if (!addressId || isSettingDefault) return;
    
    try {
      setIsSettingDefault(true);
      
      const response = await fetch(`/api/address/unset-default/${addressId}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기본 배송지 해제에 실패했습니다.');
      }
      
      // 서버에서 최신 주소 목록 가져오기
      await refreshAddresses();
      
      toast({
        title: "기본 배송지에서 해제되었습니다.",
      });
      
    } catch (error) {
      console.error('기본 배송지 해제 오류:', error);
      toast({
        variant: "destructive",
        title: "기본 배송지 해제 오류",
        description: error instanceof Error ? error.message : '기본 배송지 해제 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  // 체크박스 상태 변경 처리
  const handleDefaultCheckboxChange = (checked: boolean | "indeterminate") => {
    if (!selectedAddress) return;
    
    if (checked === true && !selectedAddress.isDefault) {
      // 체크되었고 기본 배송지가 아니면 기본 배송지로 설정
      handleSetDefaultAddress(selectedAddress.id);
    } else if (checked === false && selectedAddress.isDefault) {
      // 체크 해제되었고 기본 배송지였으면 기본 배송지에서 해제
      handleUnsetDefaultAddress(selectedAddress.id);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalPrice = selectedOptions.reduce(
    (sum, option) => sum + (option.price * (option.quantity || 0)),
    0
  );

  // 입금자명 유효성 검사 함수
  const validateDepositorName = (name: string): { isValid: boolean; message?: string } => {
    // 빈 문자열 체크
    if (!name.trim()) {
      return { 
        isValid: false, 
        message: "입금자명을 입력해주세요." 
      };
    }

    // 최소 길이 체크 (최소 2글자)
    if (name.trim().length < 2) {
      return { 
        isValid: false, 
        message: "입금자명은 최소 2글자 이상이어야 합니다." 
      };
    }

    // 자음/모음만 있는지 확인 (ㄱㄴㄷ, ㅏㅑㅓ 등)
    const singleJamoPattern = /[ㄱ-ㅎㅏ-ㅣ]/;
    if (singleJamoPattern.test(name)) {
      return {
        isValid: false,
        message: "자음이나 모음만으로 구성된 이름은 사용할 수 없습니다."
      };
    }

    // 한글 이름 체크 (완성형 한글만 허용)
    const koreanPattern = /^[가-힣]+$/;
    if (koreanPattern.test(name)) {
      // 한글 이름은 일반적으로 2~5자리
      if (name.trim().length > 5) {
        return {
          isValid: false,
          message: "한글 이름은 일반적으로 5자리 이하입니다."
        };
      }
    }

    // 영문 이름 체크 (영문 알파벳과 공백만 허용)
    const englishPattern = /^[a-zA-Z\s]+$/;
    if (englishPattern.test(name) && name.trim().length < 3) {
      return { 
        isValid: false, 
        message: "영문 이름은 최소 3글자 이상이어야 합니다." 
      };
    }

    // 특수문자 체크
    const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (specialCharPattern.test(name)) {
      return { 
        isValid: false, 
        message: "이름에 특수문자를 포함할 수 없습니다." 
      };
    }

    // 숫자 체크
    const numberPattern = /[0-9]/;
    if (numberPattern.test(name)) {
      return {
        isValid: false,
        message: "이름에 숫자를 포함할 수 없습니다."
      };
    }

    return { isValid: true };
  };

  const handlePlaceOrder = async () => {
    // 배송지가 선택되었는지 확인
    if (!selectedAddress) {
      toast({
        variant: "destructive",
        title: "배송지를 선택해주세요",
        description: "주문을 진행하기 위해서는 배송지 정보가 필요합니다."
      });
      return;
    }
    
    // 선택된 옵션이 있는지 확인
    if (selectedOptions.length === 0) {
      toast({
        variant: "destructive",
        title: "선택된 상품이 없습니다",
        description: "주문할 상품을 선택해주세요."
      });
      return;
    }
    
    // 입금자명 유효성 검사
    const nameValidation = validateDepositorName(depositorName);
    if (!nameValidation.isValid) {
      toast({
        variant: "destructive",
        title: "입금자명이 올바르지 않습니다",
        description: nameValidation.message
      });
      return;
    }

    setIsProcessingOrder(true);
    
    try {      
      // 주문 API 호출
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product,
          selectedOptions,
          selectedAddress,
          depositorName,
          totalAmount: totalPrice
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '주문 처리 중 오류가 발생했습니다.');
      }

      // 주문 성공 시 주문 정보 받기
      const orderData = await response.json();
      console.log('주문 성공:', orderData);
      
      // 주문 성공 시 계좌 정보를 state에 저장
      if (orderData.bankType && orderData.accountNumber && orderData.accountHolder) {
        setOrderAccountInfo({
          bankType: orderData.bankType,
          accountNumber: orderData.accountNumber,
          accountHolder: orderData.accountHolder
        });
      } else {
        throw new Error('주문 데이터에 계좌 정보가 없습니다.');
      }
      
      // 주문 성공 모달 표시
      setShowOrderSuccessModal(true);
      
    } catch (error) {
      console.error('주문 처리 오류:', error);
      toast({
        variant: "destructive",
        title: "주문 처리 중 오류가 발생했습니다",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요."
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // 주문 성공 후 완료 처리 
  const handleOrderComplete = () => {
    setShowOrderSuccessModal(false);
    router.push(PATH_NAME.ORDERSEARCH);
  };

  return (
    <div className="min-h-screen w-full space-y-4 bg-yellow-50 shadow-sm">
      {/* 뒤로가기 헤더 */}
      <div className="flex items-center px-4 py-3 border-b bg-white">
        <button onClick={handleGoBack} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-medium">주문 정보</h1>
      </div>
      
      <div className="p-4 space-y-4">
      {/* 배송 정보 */}
      <Card className="bg-white p-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">배송정보</span>
            <button className="text-blue-600 hover:underline" onClick={() => setShowAddressModal(true)}>변경/등록</button>
          </div>
          <div className="space-y-1 text-muted-foreground">
            {selectedAddress ? (
              <>
                <div className="flex gap-4">
                  <span className="min-w-16">받는분</span>
                  <span>{selectedAddress.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="min-w-16">연락처</span>
                  <span>{selectedAddress.phone}</span>
                </div>
                <div className="flex gap-4">
                  <span className="min-w-16">주소</span>
                  <span className="flex-1">{selectedAddress.address} {selectedAddress.detailAddress}</span>
                </div>
                {selectedAddress.memo && (
                  <div className="flex gap-4">
                    <span className="min-w-16">배송메모</span>
                    <span>{selectedAddress.memo}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-2 text-center">
                <span>등록된 배송지가 없습니다. 배송지를 등록해주세요.</span>
              </div>
            )}
          </div>
          {selectedAddress && (
            <div className="flex justify-end items-center space-x-2">
              <label
                htmlFor="default-address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                기본 배송지로 등록
              </label>
              <Checkbox 
                id="default-address" 
                checked={selectedAddress.isDefault} 
                disabled={isSettingDefault}
                onCheckedChange={handleDefaultCheckboxChange}
              />
            </div>
          )}
        </div>
      </Card>

      <Separator className="my-4" />

      {/* Order Details */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
        <div className="relative size-28 min-w-28 rounded-md overflow-hidden">
        <Image
          fill
          src={`${product.photo[0]}/avatar`}
          alt={product.title}
          className="object-cover"
        />
      </div>
          <span className="font-medium">{product.title}</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>판매 기간</span>
            <div className="flex items-center gap-2">
              <span>{formatDate(product.startDate)}</span>
              {product.endDate && (
                <>
                  <span>~</span>
                  <span>{formatDate(product.endDate)}</span>
                </>
              )}
            </div>
          </div>
          <div id="option-info" className="space-y-1">
            {selectedOptions.map((option) => (
              <div key={option.id} className="flex flex-col space-y-1 py-2">
                <div className="flex justify-between">
                  <span className="font-medium">{option.title}</span>
                  <span className="text-muted-foreground">{formatPrice(option.price)} / 개</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>수량 {option.quantity}개</span>
                  <span>{formatPrice(option.price * (option.quantity || 0))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between text-lg font-medium">
          <span>총금액</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* 입금자명 입력 */}
      <Card className="bg-white p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="depositor-name" className="font-medium">
              계좌이체 입금자명
            </Label>
            <span className="text-sm text-red-500">*필수 입력</span>
          </div>
          <div className="space-y-1">
            <Input 
              id="depositor-name"
              type="text"
              value={depositorName}
              onChange={(e) => setDepositorName(e.target.value)}
              placeholder="입금자명을 입력하세요"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              실제 입금하시는 분의 이름과 동일하게 입력해주세요.
            </p>
          </div>
        </div>
      </Card>

      {/* Bottom Button */}
      <Button 
        className="w-full" 
        size="lg"
        onClick={handlePlaceOrder}
        disabled={isProcessingOrder}
      >
        {isProcessingOrder ? "처리 중..." : "주문하기"}
      </Button>

      {showAddressModal && (
        <AddressListModal
          onClose={() => setShowAddressModal(false)}
          onAddAddress={handleAddAddress}
          onEditAddress={handleEditAddress}
          addresses={addresses}
          setAddresses={setAddresses}
          onDeleteAddress={handleDeleteAddress}
          onSelectAddress={(address) => {
            setSelectedAddress(address);
            setShowAddressModal(false);
          }}
        />
      )}

      {showAddressForm && (
        <AddressFormModal
          onClose={() => setShowAddressForm(false)}
          onSave={handleSaveAddress}
          initialData={editingAddress}
          user={user}
          refreshAddresses={refreshAddresses}
        />
      )}
      
      {showOrderSuccessModal && (
        <OrderSuccessModal
          onClose={handleOrderComplete}
          totalAmount={totalPrice}
          depositorName={depositorName}
          accountInfo={orderAccountInfo!}
        />
      )}
      </div>
    </div>
  );
} 