"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";

export interface DownloadButtonProps {
  onDownloadModeChange: (isDownloadMode: boolean) => void;
  isDownloadMode: boolean;
  onSelectAll: () => void;
}

export default function DownloadButton({
  onDownloadModeChange,
  isDownloadMode,
  onSelectAll
}: DownloadButtonProps) {

  const toggleDownloadMode = () => {
    onDownloadModeChange(!isDownloadMode);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={toggleDownloadMode}
        className="flex items-center justify-center px-4 py-2 rounded-md font-medium"
      >
        {isDownloadMode ? "돌아가기" : "운송장 다운"}
      </Button>

      {isDownloadMode && (
        <>
          <Button
            variant="outline"
            onClick={onSelectAll}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
          >
            <Check className="w-4 h-4 " />
            일괄선택
          </Button>
          <Button
            variant="outline"
            onClick={() => { }}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
          >
            <Download className="w-4 h-4" />
            운송장 다운
          </Button>
        </>
      )}
    </div>
  );
}
