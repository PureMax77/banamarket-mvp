"use client";

import { useEffect, useRef, useState } from "react";
import Input from "../input";
import { KeyIcon } from "@heroicons/react/24/outline";
import { OnlyNumberRegex, PhoneNumberRegex } from "@/lib/constants";
import { z } from "zod";

// 이메일 스키마 정의
const emailSchema = z.string().email();

export default function FindPwModal() {
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("010");
  const [code, setCode] = useState<string>("");
  const [isPhoneSend, setIsPhoneSend] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoadingReq, setIsLoadingReq] = useState<boolean>(false);
  const [isLoadingVery, setIsLoadingVery] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

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

  // 휴대폰인증번호 전송
  const onPhoneSend = async () => {
    // 이메일 형식체크
    const result = emailSchema.safeParse(email);
    if (!result.success) return alert("아이디가 이메일 형식이 아닙니다.");

    if (!PhoneNumberRegex.test(phoneNumber)) {
      return alert("잘못된 휴대폰번호입니다.");
    }

    try {
      setIsLoadingReq(true);

      const result = await fetch("/api/sms/sendfindpw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phoneNumber,
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

  // 휴대폰번호 인증
  const onVerifyCode = async () => {
    if (code.length !== 6) {
      return alert("인증번호는 6자리입니다.");
    }

    try {
      setIsLoadingVery(true);

      const result = await fetch("/api/sms/checkfindpw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone: phoneNumber,
          code,
        }),
      });

      if (result.status === 200) {
        setIsVerified(true);
        dialogRef.current?.close();
        alert(`새로운 비밀번호가 문자로 전송됐습니다.`);
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

  // 모달 닫힐때 clear 용
  useEffect(() => {
    const dialog = dialogRef.current;

    // 여기에 다이얼로그가 닫힐 때 실행할 로직을 추가할 수 있습니다.
    const handleDialogClose = () => {
      setPhoneNumber("010");
      setCode("");
      setEmail("");
      setIsPhoneSend(false);
      setIsVerified(false);
    };

    if (dialog) {
      dialog.addEventListener("close", handleDialogClose);
    }

    // 클린업 함수: 컴포넌트가 언마운트되거나 다이얼로그가 변경될 때 이벤트 리스너를 제거
    return () => {
      if (dialog) {
        dialog.removeEventListener("close", handleDialogClose);
      }
    };
  }, []);

  return (
    <>
      <button
        className="flex gap-1 items-center outline-none"
        onClick={() => dialogRef.current?.showModal()}
      >
        <KeyIcon className="w-5 h-5" /> 비밀번호 찾기
      </button>
      <dialog ref={dialogRef} id="join_modal" className="modal">
        <div className="modal-box w-full max-w-96 flex justify-center items-center flex-col">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 outline-none">
              ✕
            </button>
          </form>
          <div className="flex flex-col gap-3 max-w-lg w-full">
            <h3 className="font-bold text-lg mb-2">비밀번호 찾기</h3>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={onEmailChange}
              placeholder="아이디(이메일)"
              required
            />
            <div className="flex gap-3 w-full">
              <Input
                name="phone"
                type="text"
                value={phoneNumber}
                onChange={onPhoneChange}
                placeholder="휴대폰(숫자만 입력)"
                readOnly={isVerified}
                required
              />
              <button
                type="button"
                className="btn w-24"
                onClick={onPhoneSend}
                disabled={isVerified || isLoadingReq}
              >
                {isLoadingReq ? "요청중..." : "인증요청"}
              </button>
            </div>
            <div className="flex gap-3 w-full">
              <Input
                name="verifyCode"
                type="text"
                value={code}
                onChange={onCodeChange}
                placeholder="인증번호(6자리)"
                disabled={!isPhoneSend}
                readOnly={isVerified}
              />
              <button
                type="button"
                className="btn w-24"
                onClick={onVerifyCode}
                disabled={!isPhoneSend || isVerified || isLoadingVery}
              >
                {isLoadingVery ? "인증중..." : "인증"}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
