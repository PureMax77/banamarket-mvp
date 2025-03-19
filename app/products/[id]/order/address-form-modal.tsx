"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    daum: any;
  }
}

interface AddressFormProps {
  onClose: () => void
  onSave: (address: {
    id?: number | string
    name: string
    phone: string
    zipCode: string
    address: string
    detailAddress: string
    memo: string
    isDefault: boolean
  }) => void
  initialData?: {
    id?: number | string
    name: string
    phone: string
    zipCode: string
    address: string
    detailAddress: string
    memo: string
    isDefault: boolean
  }
  user?: User & { addresses: any[] }
  refreshAddresses?: () => Promise<void>
}

export default function AddressFormModal({ onClose, onSave, initialData, user, refreshAddresses }: AddressFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    id: initialData?.id,
    name: initialData?.name || user?.name || "",
    phone: initialData?.phone || user?.phone || "",
    zipCode: initialData?.zipCode || "",
    address: initialData?.address || "",
    detailAddress: initialData?.detailAddress || "",
    memo: initialData?.memo || "",
    isDefault: initialData?.isDefault || false,
  })
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isCustomMemo, setIsCustomMemo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addressSearchContainer = useRef<HTMLDivElement>(null)

  // 카카오 주소 검색 API 스크립트 로드
  useEffect(() => {
    // 이미 로드된 경우 체크
    if (document.querySelector('script[src*="postcode.v2.js"]') || window.daum?.Postcode) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    document.head.appendChild(script)

    return () => {
      // 필요한 경우에만 스크립트 제거
      // 다른 컴포넌트에서도 사용할 수 있으므로 일반적으로는 제거하지 않음
    }
  }, [])

  // 초기화시 메모가 미리 정의된 옵션이 아니면 직접 입력 모드로 설정
  useEffect(() => {
    if (formData.memo && !isDefaultMemoOption(formData.memo)) {
      setIsCustomMemo(true)
    }
  }, [])

  const isDefaultMemoOption = (memo: string) => {
    return [
      "",
      "부재시 경비실에 맡겨주세요",
      "부재시 택배함에 넣어주세요",
      "배송 전 연락 바랍니다",
      "문 앞에 놓아주세요",
      "파손위험이 있으니 배송시 주의해주세요"
    ].includes(memo)
  }

  // 주소 검색 모달이 열렸을 때만 포스트코드 인스턴스 생성
  useEffect(() => {
    if (isAddressModalOpen && isScriptLoaded && addressSearchContainer.current) {
      if (window.daum && window.daum.Postcode) {
        const postcode = new window.daum.Postcode({
          oncomplete: function(data: any) {
            // 선택한 주소 데이터를 폼에 반영
            setFormData(prev => ({
              ...prev,
              zipCode: data.zonecode,
              address: data.address,
            }))
            // 상세주소 입력 필드에 포커스
            document.getElementById('detailAddress')?.focus()
            // 주소 검색 닫기
            setIsAddressModalOpen(false)
          },
          onresize: function(size: any) {
            // 스크롤이 가능한 상태로 만들기 위해 높이 조정
            if (addressSearchContainer.current) {
              addressSearchContainer.current.style.height = size.height + 'px'
            }
          },
          width: '100%',
          height: '100%',
          animation: true,
        })
        
        postcode.embed(addressSearchContainer.current)
      }
    }
  }, [isAddressModalOpen, isScriptLoaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }))
  }

  const handleMemoChange = (value: string) => {
    if (value === "직접입력") {
      setIsCustomMemo(true)
      setFormData((prev) => ({ ...prev, memo: "" }))
    } else {
      setIsCustomMemo(false)
      setFormData((prev) => ({ ...prev, memo: value }))
    }
  }

  const handleCustomMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, memo: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 검증
    if (!formData.name || !formData.phone || !formData.zipCode || !formData.address) {
      toast({
        variant: "destructive",
        title: "필수 정보를 모두 입력해주세요.",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // API URL 및 Method 설정 (수정 또는 추가)
      const isEditing = initialData && initialData.id
      const apiUrl = isEditing 
        ? `/api/address/update/${initialData.id}` 
        : '/api/address/add'
      const method = isEditing ? 'PUT' : 'POST'
      
      // API 호출
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (isEditing ? '배송지 수정에 실패했습니다.' : '배송지 저장에 실패했습니다.'))
      }
      
      const savedAddress = await response.json()
      
      // 서버에서 최신 주소 목록 새로 불러오기
      if (refreshAddresses) {
        await refreshAddresses()
      }
      
      // 부모 컴포넌트에 저장 완료 알림
      onSave(savedAddress)
      
      // 성공 메시지
      toast({
        title: isEditing ? "배송지가 수정되었습니다." : "배송지가 저장되었습니다.",
      })
      
      // 모달 닫기
      onClose()
    } catch (error) {
      console.error("배송지 저장 오류:", error)
      toast({
        variant: "destructive",
        title: "배송지 저장 오류",
        description: error instanceof Error ? error.message : '배송지 저장 중 오류가 발생했습니다.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearchAddress = () => {
    // 스크립트가 로드되었는지 확인
    if (!isScriptLoaded) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    
    // 바텀시트로 주소 검색 열기
    setIsAddressModalOpen(true)
  }

  const closeAddressModal = () => {
    setIsAddressModalOpen(false)
  }

  return (
    <div className="m-screen-set fixed inset-0 bg-white flex flex-col h-full" style={{"marginTop": "0px"}}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b">
        <button onClick={onClose} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-medium">{initialData?.id ? "배송지 수정" : "배송지 추가"}</h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5">
            <h2 className="text-lg font-medium mb-4">배송 정보</h2>

            <div className="space-y-4">
              {/* Recipient */}
              <div>
                <Label htmlFor="name" className="flex items-center text-sm font-medium">
                  받는 사람
                  <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력해 주세요"
                  className="mt-1 border rounded-md p-3"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                  휴대폰
                  <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="휴대폰 번호를 입력해 주세요"
                  className="mt-1 border rounded-md p-3"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="zipCode" className="flex items-center text-sm font-medium">
                  주소
                  <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="우편번호"
                    className="border rounded-md p-3 flex-1"
                    readOnly
                  />
                  <Button
                    type="button"
                    onClick={handleSearchAddress}
                    className="bg-gray-100 hover:bg-gray-200 text-black border rounded-md px-4"
                  >
                    주소 검색
                  </Button>
                </div>

                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="기본주소"
                  className="mt-2 border rounded-md p-3"
                  readOnly
                />

                <Input
                  id="detailAddress"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleChange}
                  placeholder="상세주소를 입력해 주세요"
                  className="mt-2 border rounded-md p-3"
                />
              </div>

              {/* Delivery Memo */}
              <div>
                <Label htmlFor="memo" className="text-sm font-medium">
                  배송 메모
                </Label>
                <Select 
                  value={isCustomMemo ? "직접입력" : formData.memo} 
                  onValueChange={handleMemoChange}
                >
                  <SelectTrigger className="w-full mt-1 border rounded-md p-3 flex justify-between items-center">
                    <SelectValue placeholder="배송 메모를 선택해 주세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="부재시 경비실에 맡겨주세요">부재시 경비실에 맡겨주세요</SelectItem>
                    <SelectItem value="부재시 택배함에 넣어주세요">부재시 택배함에 넣어주세요</SelectItem>
                    <SelectItem value="배송 전 연락 바랍니다">배송 전 연락 바랍니다</SelectItem>
                    <SelectItem value="문 앞에 놓아주세요">문 앞에 놓아주세요</SelectItem>
                    <SelectItem value="파손위험이 있으니 배송시 주의해주세요">
                      파손위험이 있으니 배송시 주의해주세요
                    </SelectItem>
                    <SelectItem value="직접입력">직접입력</SelectItem>
                  </SelectContent>
                </Select>
                
                {isCustomMemo && (
                  <Input
                    id="customMemo"
                    name="customMemo"
                    value={formData.memo}
                    onChange={handleCustomMemoChange}
                    placeholder="배송 메모를 입력해 주세요"
                    className="mt-2 border rounded-md p-3"
                  />
                )}
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={handleCheckboxChange}
                  className="rounded-full h-5 w-5 border-gray-300"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  기본배송지로 등록하기
                </label>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="px-4 py-4 mt-auto">
            <Button
              type="submit"
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (initialData?.id ? "수정 중..." : "저장 중...") 
                : (initialData?.id ? "수정" : "저장")
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Address Search Modal */}
      {isAddressModalOpen && (
        <div className="m-screen-set fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end transition-transform duration-300 ease-in-out">
          <div className="bg-white rounded-t-2xl overflow-hidden h-[60vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">주소 검색</h2>
              <button onClick={closeAddressModal} className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div ref={addressSearchContainer} className="flex-1 overflow-auto"></div>
          </div>
        </div>
      )}

      {/* Bottom indicator */}
      <div className="flex justify-center pb-2 pt-1">
        <div className="w-32 h-1.5 bg-gray-800 rounded-full"></div>
      </div>
    </div>
  )
}

