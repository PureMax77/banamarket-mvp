"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Address {
  id: string | number
  name: string
  address: string
  detailAddress: string
  phoneNumber?: string
  phone?: string
  memo: string
  isDefault?: boolean
  zipCode?: string
}

interface AddressListModalProps {
  onClose: () => void
  onAddAddress: () => void
  onEditAddress: (address: Address) => void
  addresses?: Address[]
  setAddresses?: React.Dispatch<React.SetStateAction<Address[]>>
  onSelectAddress?: (address: Address) => void
  onDeleteAddress?: (addressId: string | number) => void
}

export default function AddressListModal({ 
  onClose, 
  onAddAddress, 
  onEditAddress, 
  addresses: serverAddresses,
  setAddresses,
  onSelectAddress,
  onDeleteAddress
}: AddressListModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  // 서버로부터 받은 주소가 있으면 그걸 사용하고, 없으면 더미 데이터 사용
  const [addresses, setLocalAddresses] = useState<Address[]>(
    serverAddresses || [
      {
        id: "1",
        name: "장모님댁",
        address: "(02810) 서울 성북구 종암로11길 28 또다래하우스빌 601호",
        detailAddress: "",
        phoneNumber: "01090190863",
        memo: "공동현관번호: 빌9630확인",
      },
      {
        id: "2",
        name: "정상현",
        address: "(13121) 경기 성남시 수정구 위례순환로 53 3602동 910호",
        detailAddress: "",
        phoneNumber: "01066922351",
        memo: "파손위험이 있으니 배송시 주의해주세요.",
      },
      {
        id: "3",
        name: "진정희",
        address: "(18279) 경기 화성시 남양읍 무하로111번길 50 103동 406호",
        detailAddress: "",
        phoneNumber: "01028042351",
        memo: "파손위험이 있으니 배송시 주의해주세요.",
      },
    ]
  )
  
  // serverAddresses가 변경될 때마다 로컬 상태 업데이트
  useEffect(() => {
    if (serverAddresses) {
      // console.log('주소 목록 업데이트:', serverAddresses);
      setLocalAddresses(serverAddresses);
    }
  }, [serverAddresses]);
  
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | number | null>(null)

  const handleEdit = (id: string | number) => {
    const addressToEdit = addresses.find((addr) => addr.id === id)
    if (addressToEdit) {
      onEditAddress(addressToEdit)
    }
  }

  const handleDelete = async (id: string | number) => {
    try {
      // 삭제중임을 표시
      setIsDeleting(id)
      
      // API 호출하여 주소 삭제
      const response = await fetch(`/api/address/delete/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '배송지 삭제에 실패했습니다.')
      }
      
      // 성공 시 로컬 상태에서도 제거
      setLocalAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== id))
      
      // 부모 컴포넌트의 주소 목록도 업데이트
      if (setAddresses) {
        setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== id))
      }
      
      // 삭제 처리 콜백 호출
      if (onDeleteAddress) {
        onDeleteAddress(id)
      }
      
      setShowConfirmDelete(null)
      
      // 성공 메시지
      toast({
        title: "배송지가 삭제되었습니다.",
      })
    } catch (error) {
      console.error("배송지 삭제 오류:", error)
      toast({
        variant: "destructive",
        title: "배송지 삭제 오류",
        description: error instanceof Error ? error.message : '배송지 삭제 중 오류가 발생했습니다.',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleConfirmDelete = (id: string | number) => {
    setShowConfirmDelete(id)
  }

  const handleCancelDelete = () => {
    setShowConfirmDelete(null)
  }

  const handleAddAddress = () => {
    onAddAddress()
  }

  const handleSelectAddress = (address: Address) => {
    if (onSelectAddress) {
      onSelectAddress(address)
    }
  }

  return (
    <div className="m-screen-set fixed inset-0 bg-white flex flex-col h-full" style={{"marginTop": "0px"}}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b">
        <button onClick={onClose} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-medium">배송지 목록</h1>
      </div>

      {/* Address list */}
      <div className="flex-1 overflow-auto">
        {addresses.length > 0 ? (
          addresses.map((address, index) => (
            <div key={address.id} onClick={() => handleSelectAddress(address)} className="cursor-pointer">
              <div className="px-4 py-5">
                <div className="flex items-center space-x-2">
                  <div className="font-medium text-base mb-1">{address.name}</div>
                  {address.isDefault && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">기본</span>
                  )}
                </div>
                <div className="text-sm mb-1">{address.address}</div>
                <div className="text-sm mb-3">{address.phoneNumber || address.phone}</div>

                <div className="text-sm font-medium mb-1">배송 메모</div>
                <div className="text-sm text-gray-700">{address.memo || "-"}</div>

                <div className="flex justify-end mt-3 space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleEdit(address.id);
                    }}
                    className="text-sm text-gray-500"
                    disabled={isDeleting === address.id}
                  >
                    수정
                  </button>
                  <span className="text-gray-300">|</span>
                  
                  {showConfirmDelete === address.id ? (
                    <div onClick={(e) => e.stopPropagation()} className="flex space-x-2">
                      <button 
                        onClick={() => handleDelete(address.id)}
                        className="text-sm text-red-500"
                        disabled={isDeleting === address.id}
                      >
                        {isDeleting === address.id ? "삭제중..." : "확인"}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={handleCancelDelete}
                        className="text-sm text-gray-500"
                        disabled={isDeleting === address.id}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(address.id);
                      }}
                      className="text-sm text-gray-500"
                      disabled={isDeleting === address.id}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              {index < addresses.length - 1 && <Separator />}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-gray-500">등록된 배송지가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Add address button */}
      <div className="p-4">
        <Button
          onClick={handleAddAddress}
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-lg"
        >
          배송지 추가
        </Button>
      </div>

      {/* Bottom indicator */}
      <div className="flex justify-center pb-2 pt-1">
        <div className="w-32 h-1.5 bg-gray-800 rounded-full"></div>
      </div>
    </div>
  )
}

