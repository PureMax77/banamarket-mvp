"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OnlyNumberRegex, PhoneNumberRegex } from "@/lib/constants";

export default function FindEmailModal() {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("010");
  const [code, setCode] = useState<string>("");
  const [isPhoneSend, setIsPhoneSend] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoadingReq, setIsLoadingReq] = useState<boolean>(false);
  const [isLoadingVery, setIsLoadingVery] = useState<boolean>(false);

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (OnlyNumberRegex.test(e.target.value) || e.target.value === "") {
      setPhoneNumber(e.target.value);
    }
  };

  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    if (OnlyNumberRegex.test(newCode) || newCode === "") {
      if (newCode.length > 6) return;
      else setCode(newCode);
    }
  };

  const onPhoneSend = async () => {
    if (!PhoneNumberRegex.test(phoneNumber)) {
      return alert("잘못된 휴대폰번호입니다.");
    }

    try {
      setIsLoadingReq(true);

      const result = await fetch("/api/sms/sendfindemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      if (result.status === 200) {
        if (!isPhoneSend) setIsPhoneSend(true);
        alert("인증번호를 전송했습니다.");
      } else {
        const { msg } = await result.json();
        alert(msg);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoadingReq(false);
    }
  };

  const onVerifyCode = async () => {
    if (code.length !== 6) {
      return alert("인증번호는 6자리입니다.");
    }

    try {
      setIsLoadingVery(true);

      const result = await fetch("/api/sms/checkfindemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code,
        }),
      });

      if (result.status === 200) {
        const { email } = await result.json();
        setIsVerified(true);
        setOpen(false);
        alert(`회원님의 아이디는 ${email} 입니다.`);
      } else {
        const { msg } = await result.json();
        alert(msg);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoadingVery(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setPhoneNumber("010");
      setCode("");
      setIsPhoneSend(false);
      setIsVerified(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex gap-1 items-center">
          <MagnifyingGlassIcon className="w-5 h-5" />
          아이디 찾기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>아이디(이메일) 찾기</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              name="phone"
              type="text"
              value={phoneNumber}
              onChange={onPhoneChange}
              placeholder="휴대폰(숫자만 입력)"
              readOnly={isVerified}
              required
            />
            <Button onClick={onPhoneSend} disabled={isVerified || isLoadingReq}>
              {isLoadingReq ? "요청중..." : "인증요청"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              name="verifyCode"
              type="text"
              value={code}
              onChange={onCodeChange}
              placeholder="인증번호(6자리)"
              disabled={!isPhoneSend}
              readOnly={isVerified}
            />
            <Button
              onClick={onVerifyCode}
              disabled={!isPhoneSend || isVerified || isLoadingVery}
            >
              {isLoadingVery ? "인증중..." : "인증"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
