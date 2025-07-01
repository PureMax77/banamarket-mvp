"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download, ArrowLeft } from "lucide-react";

export interface DownloadButtonProps {
  onDownloadModeChange: (isDownloadMode: boolean) => void;
  isDownloadMode: boolean;
  onSelectAll: () => void;
  selectedProducts: number[];
}

export default function DownloadButton({
  onDownloadModeChange,
  isDownloadMode,
  onSelectAll,
  selectedProducts
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleDownloadMode = () => {
    onDownloadModeChange(!isDownloadMode);
  };

  const handleDownload = async (downloadType: 'notDownloaded' | 'all') => {
    if (selectedProducts.length === 0) {
      alert('다운로드할 상품을 선택해주세요.');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch('/api/download/down-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          downloadType: downloadType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '다운로드에 실패했습니다.');
      }

      // 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      // Content-Disposition 헤더에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = '주문내역.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (match) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('다운로드가 완료되었습니다.');
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : '다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={toggleDownloadMode}
        className="flex items-center justify-center px-4 py-2 rounded-md font-medium"
      >
        {isDownloadMode ? <ArrowLeft className="w-4 h-4" /> : "엑셀다운"}
      </Button>

      {isDownloadMode && (
        <>
          <Button
            variant="outline"
            onClick={onSelectAll}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
          >
            {/* <Check className="w-4 h-4 " /> */}
            일괄선택
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload('notDownloaded')}
            disabled={isDownloading || selectedProducts.length === 0}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
          >
            {/* <Download className="w-4 h-4 mr-1" /> */}
            미다운 다운
            {/* ({selectedProducts.length}) */}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload('all')}
            disabled={isDownloading || selectedProducts.length === 0}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
          >
            {/* <Download className="w-4 h-4 mr-1" /> */}
            전체다운
            {/* ({selectedProducts.length}) */}
          </Button>
        </>
      )}
    </div>
  );
}
