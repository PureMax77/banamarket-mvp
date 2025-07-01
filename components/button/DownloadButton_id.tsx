"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

export interface DownloadButtonIdProps {
    onDownloadNotDownloaded?: () => void;
    onDownloadAll?: () => void;
}

export default function DownloadButtonId({
    onDownloadNotDownloaded,
    onDownloadAll
}: DownloadButtonIdProps) {
    const [isDownloadMode, setIsDownloadMode] = useState<boolean>(false);

    const toggleDownloadMode = () => {
        setIsDownloadMode(!isDownloadMode);
    };

    return (
        <div className="flex items-center gap-2 pb-4 px-6">
            {!isDownloadMode ? (
                <Button
                    variant="outline"
                    onClick={toggleDownloadMode}
                    className="flex items-center justify-center px-4 py-2 rounded-md font-medium"
                >
                    엑셀다운
                </Button>
            ) : (
                <>
                    <Button
                        variant="outline"
                        onClick={toggleDownloadMode}
                        className="flex items-center justify-center px-4 py-2 rounded-md font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onDownloadNotDownloaded}
                        className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
                    >
                        미다운 다운
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onDownloadAll}
                        className="flex items-center justify-center px-4 py-2 rounded-md font-medium bg-yellow-400"
                    >
                        {/* <Download className="w-4 h-4 mr-1" /> */}
                        전체다운
                    </Button>
                </>
            )}
        </div>
    );
}
