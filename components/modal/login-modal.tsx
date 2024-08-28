"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../button";
import Input from "../input";
import Link from "next/link";
import { useFormState } from "react-dom";
import { createAccount } from "@/app/(auth)/join/action";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  OnlyNumberRegex,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PhoneNumberRegex,
} from "@/lib/constants";

export default function LoginModal() {
  const [state, dispatch] = useFormState(createAccount, null);

  const [phoneNumber, setPhoneNumber] = useState<string>("010");
  const [code, setCode] = useState<string>("");
  const [isPhoneSend, setIsPhoneSend] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isAllCheck, setIsAllCheck] = useState<boolean>(false);

  const [isLoadingReq, setIsLoadingReq] = useState<boolean>(false);
  const [isLoadingVery, setIsLoadingVery] = useState<boolean>(false);

  const [isAdultCheck, setIsAdultCheck] = useState<boolean>(false); // 14세 이상 동의
  const [isTermCheck, setIsTermCheck] = useState<boolean>(false); // 이용약관 동의
  const [isInfoCheck, setIsInfoCheck] = useState<boolean>(false); // 개인정보 동의
  const [isAdCheck, setIsAdCheck] = useState<boolean>(false); // 광고수신 동의
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleAllCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAllCheck(e.target.checked);
    setIsAdultCheck(e.target.checked);
    setIsTermCheck(e.target.checked);
    setIsInfoCheck(e.target.checked);
    setIsAdCheck(e.target.checked);
  };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (OnlyNumberRegex.test(e.target.value) || e.target.value === "") {
      setPhoneNumber(e.target.value);
    }
  };

  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    if (newCode.length > 6) return;
    else setCode(newCode);
  };

  // 휴대폰인증번호 전송
  const onPhoneSend = async () => {
    if (!PhoneNumberRegex.test(phoneNumber)) {
      return alert("잘못된 휴대폰번호입니다.");
    }

    try {
      setIsLoadingReq(true);

      const result = await fetch("/api/sms/sendcode", {
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

  // 휴대폰번호 인증
  const onVerifyCode = async () => {
    if (code.length !== 6) {
      return alert("인증번호는 6자리입니다.");
    }

    try {
      setIsLoadingVery(true);

      const result = await fetch("/api/sms/checkcode", {
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
        setIsVerified(true);
        alert("인증에 성공했습니다.");
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

    const handleDialogClose = () => {
      console.log("Dialog was closed");
      // 여기에 다이얼로그가 닫힐 때 실행할 로직을 추가할 수 있습니다.
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

  useEffect(() => {
    if (isAdultCheck && isTermCheck && isInfoCheck && isAdCheck) {
      setIsAllCheck(true);
    } else {
      setIsAllCheck(false);
    }
  }, [isAdultCheck, isTermCheck, isInfoCheck, isAdCheck]);

  return (
    <>
      <button
        className="text-neutral-500 mt-4 text-lg outline-none"
        onClick={() => dialogRef.current?.showModal()}
      >
        이메일 로그인
      </button>
      <dialog ref={dialogRef} id="join_modal" className="modal">
        <div className="modal-box w-full max-w-96 flex justify-center items-center flex-col">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 outline-none">
              ✕
            </button>
          </form>
          <form
            action={dispatch}
            className="flex flex-col gap-3 max-w-lg w-full"
          >
            <h3 className="font-bold text-lg mb-2">이메일 로그인</h3>
            <Input
              name="email"
              type="email"
              placeholder="아이디(이메일)"
              required
              errors={state?.fieldErrors.email}
            />
            <Input
              name="password"
              type="password"
              placeholder="비밀번호"
              errors={state?.fieldErrors.password}
              required
            />
            <Button
              text="로그인"
              addClassName="btn-outline bg-black text-white"
            />
          </form>
        </div>
      </dialog>
    </>
  );
}
