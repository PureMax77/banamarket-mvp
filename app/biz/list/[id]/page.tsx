"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, Download } from "lucide-react";
import HeaderWithTitle from "@/components/BackHeader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DownloadButtonId from "@/components/button/DownloadButton_id";

// 테이블 컴포넌트 타입 정의
interface TableProps {
    children: ReactNode;
}

interface TableComponentProps {
    children: ReactNode;
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

// Table 컴포넌트
const Table: React.FC<TableProps> = ({ children }) => {
    return <table className="w-full min-w-[500px] border-collapse">{children}</table>;
};

const TableHeader: React.FC<TableComponentProps> = ({ children }) => {
    return <thead className="bg-gray-50 text-xs uppercase">{children}</thead>;
};

const TableBody: React.FC<TableComponentProps> = ({ children }) => {
    return <tbody>{children}</tbody>;
};

const TableRow: React.FC<TableComponentProps> = ({ children }) => {
    return <tr className="border-b hover:bg-gray-50">{children}</tr>;
};

const TableHead: React.FC<TableComponentProps> = ({ children }) => {
    return <th className="px-3 py-3 text-left">{children}</th>;
};

const TableCell: React.FC<TableCellProps> = ({ children, className = "" }) => {
    return <td className={`px-3 py-2 ${className}`}>{children}</td>;
};

const cn = (...classes: string[]) => {
    return classes.filter(Boolean).join(" ");
};

interface ProductOption {
    id: number;
    title: string;
    price: number;
    discount: number;
}

interface OrderOption {
    id: number;
    quantity: number;
    price: number;
    optionTitle: string;
    productOptionId: number;
}

interface User {
    id: number;
    username: string;
    name: string | null;
}

interface Order {
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
    isInvoiceDownloaded: boolean;
    created_at: string;
    user: User;
    orderOptions: OrderOption[];
}

interface Product {
    id: number;
    title: string;
    photo: string[];
    description: string;
    startDate: string;
    endDate: string | null;
    options: ProductOption[];
    orders: Order[];
}

export default function ProductOrdersPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 필터 상태
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [showNotDownloaded, setShowNotDownloaded] = useState<boolean>(false);
    const [usernameFilter, setUsernameFilter] = useState<string>("");

    // 필터링된 주문
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

    // 다운로드 핸들러 함수들
    const handleDownloadNotDownloaded = async () => {
        try {
            const response = await fetch('/api/download/down-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    downloadType: 'notDownloaded'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || '다운로드 중 오류가 발생했습니다.');
                return;
            }

            // 파일 다운로드
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            // 파일명 추출 (Content-Disposition 헤더에서)
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `주문내역_미다운_상품${productId}_${new Date().toISOString().split('T')[0]}.xlsx`;

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
                if (fileNameMatch) {
                    fileName = decodeURIComponent(fileNameMatch[1]);
                }
            }

            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // 다운로드 완료 후 주문 목록 새로고침
            const fetchResponse = await fetch(`/api/product/${productId}/orders`);
            if (fetchResponse.ok) {
                const data = await fetchResponse.json();
                setProduct(data);
                setFilteredOrders(data.orders || []);
            }

            alert('미다운로드 엑셀 다운로드가 완료되었습니다.');
        } catch (error) {
            console.error('다운로드 오류:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        }
    };

    const handleDownloadAll = async () => {
        try {
            const response = await fetch('/api/download/down-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    downloadType: 'all'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || '다운로드 중 오류가 발생했습니다.');
                return;
            }

            // 파일 다운로드
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            // 파일명 추출 (Content-Disposition 헤더에서)
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `주문내역_상품${productId}_${new Date().toISOString().split('T')[0]}.xlsx`;

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
                if (fileNameMatch) {
                    fileName = decodeURIComponent(fileNameMatch[1]);
                }
            }

            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // 다운로드 완료 후 주문 목록 새로고침
            const fetchResponse = await fetch(`/api/product/${productId}/orders`);
            if (fetchResponse.ok) {
                const data = await fetchResponse.json();
                setProduct(data);
                setFilteredOrders(data.orders || []);
            }

            alert('엑셀 다운로드가 완료되었습니다.');
        } catch (error) {
            console.error('다운로드 오류:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        }
    };

    // 상품 데이터와 주문 가져오기
    useEffect(() => {
        const fetchProductOrders = async () => {
            if (!productId) return;

            try {
                setIsLoading(true);
                const response = await fetch(`/api/product/${productId}/orders`);

                if (!response.ok) {
                    throw new Error("상품 주문 내역을 불러오는데 실패했습니다.");
                }

                const data = await response.json();
                setProduct(data);
                setFilteredOrders(data.orders || []);
            } catch (err) {
                setError("주문 내역을 불러오는데 오류가 발생했습니다.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductOrders();
    }, [productId]);

    // 필터 적용
    const applyFilters = () => {
        if (!product || !product.orders) return;

        let filtered = [...product.orders];

        // 날짜 범위 필터
        if (startDate && endDate) {
            filtered = filtered.filter((order) => {
                const orderDate = parseISO(order.created_at);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }

        // 미다운로드 운송장 필터
        if (showNotDownloaded) {
            filtered = filtered.filter((order) => !order.isInvoiceDownloaded);
        }

        // 사용자명 필터
        if (usernameFilter.trim() !== "") {
            filtered = filtered.filter((order) =>
                order.user.username.toLowerCase().includes(usernameFilter.toLowerCase()) ||
                (order.user.name && order.user.name.toLowerCase().includes(usernameFilter.toLowerCase()))
            );
        }

        setFilteredOrders(filtered);
    };

    // 날짜 포맷 헬퍼 함수
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "진행중";
        return format(new Date(dateString), "yyyy-MM-dd");
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
    }

    if (error || !product) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">
            {error || "상품을 찾을 수 없습니다."}
        </div>;
    }

    return (
        <div className="container mx-auto min-h-screen pb-28">
            <HeaderWithTitle title="상세 주문내역" />

            <div className="px-4">
                {/* 상품 기본 정보 */}
                <Card className="my-4">
                    <CardContent className="mt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {product.photo && product.photo.length > 0 && (
                                <div className="w-full md:w-1/4">
                                    <img
                                        src={`${product.photo[0]}/avatar`}
                                        alt={product.title}
                                        className="w-full h-auto rounded-md object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{product.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    판매기간: {formatDate(product.startDate)} ~ {formatDate(product.endDate)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 필터 부분 */}
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>주문 필터</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3">
                            {/* 기간 필터 */}
                            <div className="space-y-2">
                                <Label>주문 기간</Label>
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date: Date | null) => setStartDate(date || undefined)}
                                            placeholderText="시작일"
                                            dateFormat="yyyy-MM-dd"
                                            className="w-full p-2 border rounded hover:cursor-pointer"
                                            customInput={
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "yyyy-MM-dd") : "시작일"}
                                                </Button>
                                            }
                                        />
                                    </div>
                                    <span className="flex items-center">~</span>
                                    <div className="relative">
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date: Date | null) => setEndDate(date || undefined)}
                                            placeholderText="종료일"
                                            dateFormat="yyyy-MM-dd"
                                            className="w-full p-2 border rounded hover:cursor-pointer"
                                            customInput={
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "yyyy-MM-dd") : "종료일"}
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* 운송장 미다운로드 필터 */}
                                <div className="space-y-2">
                                    <Label>운송장 상태</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="not-downloaded"
                                            checked={showNotDownloaded}
                                            onCheckedChange={(checked) =>
                                                setShowNotDownloaded(checked === true)
                                            }
                                        />
                                        <label
                                            htmlFor="not-downloaded"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            미다운로드만 보기
                                        </label>
                                    </div>
                                </div>

                                {/* 주문자명 필터 */}
                                <div className="space-y-2">
                                    <Label htmlFor="username">주문자명</Label>
                                    <Input
                                        id="username"
                                        placeholder="주문자명 입력"
                                        value={usernameFilter}
                                        onChange={(e) => setUsernameFilter(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button onClick={applyFilters} className="w-full mt-4">
                            필터 적용
                        </Button>
                    </CardContent>
                </Card>

                {/* 주문 목록 */}
                <Card>
                    <CardHeader>
                        <CardTitle>주문 내역 ({filteredOrders.length}건)</CardTitle>
                    </CardHeader>

                    {/* 엑셀다운 버튼 컴포넌트 */}
                    <DownloadButtonId
                        onDownloadNotDownloaded={handleDownloadNotDownloaded}
                        onDownloadAll={handleDownloadAll}
                    />

                    <CardContent>
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-8">주문 내역이 없습니다.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>주문번호</TableHead>
                                            <TableHead>주문일</TableHead>
                                            <TableHead>주문자</TableHead>
                                            <TableHead>총 주문금액</TableHead>
                                            <TableHead>다운여부</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.orderNumber}</TableCell>
                                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                                <TableCell>{order.user.username}</TableCell>
                                                <TableCell className="font-bold">
                                                    {order.totalAmount.toLocaleString()}원
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {order.isInvoiceDownloaded ? (
                                                        <span>✓</span>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
