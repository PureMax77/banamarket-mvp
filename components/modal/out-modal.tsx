"use client";

import { useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PATH_NAME } from "@/lib/constants";

export default function OutModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleExit = () => {
    setOpen(false);
    router.push(PATH_NAME.PROFILE);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <ArrowUturnLeftIcon className="w-7 h-7 transform scale-y-[-1]" />
          <span>나가기</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-72 text-center" closeButton={false}>
        <DialogHeader className="items-center">
          <DialogTitle>판매자 페이지에서 나가기</DialogTitle>
          <DialogDescription>
            판매자 페이지에서 나가시겠습니까?
            <br />
            작성중인 내용은 저장되지 않습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex justify-center gap-3">
          <Button onClick={handleExit} className="w-28">
            네, 나갈래요
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            className="w-28"
          >
            아니요
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
