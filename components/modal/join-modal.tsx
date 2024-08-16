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
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PhoneNumberRegex,
} from "@/lib/constants";

export default function JoinModal() {
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
    setPhoneNumber(e.target.value);
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
        이메일 회원가입
      </button>
      <dialog ref={dialogRef} id="join_modal" className="modal">
        <div className="modal-box max-w-none w-full min-h-screen rounded-none flex justify-center items-center flex-col">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 outline-none">
              ✕
            </button>
          </form>
          <form
            action={dispatch}
            className="flex flex-col gap-3 max-w-lg w-full"
          >
            <h3 className="font-bold text-lg mb-2">이메일 회원가입</h3>
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
              placeholder="비밀번호(영문,숫자,특수문자 8~20자리)"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              errors={state?.fieldErrors.password}
              required
            />
            <Input
              name="confirm_password"
              type="password"
              placeholder="비밀번호 확인"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              errors={state?.fieldErrors.confirm_password}
              required
            />
            <Input
              name="name"
              type="text"
              placeholder="이름"
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              errors={state?.fieldErrors.name}
              required
            />
            <div className="flex gap-3 w-full">
              <Input
                id="noarrow-number-input"
                name="phone"
                type="number"
                value={phoneNumber}
                onChange={onPhoneChange}
                placeholder="휴대폰(숫자만 입력)"
                errors={state?.fieldErrors.phone}
                disabled={isVerified}
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
                id="noarrow-number-input"
                name="verifyCode"
                type="number"
                value={code}
                onChange={onCodeChange}
                placeholder="인증번호(6자리)"
                disabled={!isPhoneSend || isVerified}
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
            <div className="flex flex-col gap-2 py-3 *:flex *:items-center *:gap-2">
              <div>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isAllCheck}
                  onChange={handleAllCheckbox}
                />
                약관 전체 동의
              </div>
              <div className="border h-px border-t-[0.5px] border-neutral-200 my-1" />
              <div className="text-sm text-neutral-500">
                <input
                  name="adult_check"
                  type="checkbox"
                  className="checkbox"
                  checked={isAdultCheck}
                  onChange={(e: any) => setIsAdultCheck(e.target.checked)}
                />
                필수_만 14세 이상입니다.
              </div>
              <div className="text-sm text-neutral-500">
                <input
                  name="term_check"
                  type="checkbox"
                  className="checkbox"
                  checked={isTermCheck}
                  onChange={(e: any) => setIsTermCheck(e.target.checked)}
                />
                필수_이용약관 동의{" "}
                <Link href={"/"} target="_blank" className="text-xs">
                  [약관 보기]
                </Link>
              </div>
              <div className="text-sm text-neutral-500">
                <input
                  name="info_check"
                  type="checkbox"
                  className="checkbox"
                  checked={isInfoCheck}
                  onChange={(e: any) => setIsInfoCheck(e.target.checked)}
                />
                필수_개인정보 수집 및 이용 동의{" "}
                <Link href={"/"} target="_blank" className="text-xs">
                  [약관 보기]
                </Link>
              </div>
              <div className="text-sm text-neutral-500">
                <input
                  name="ad_check"
                  type="checkbox"
                  className="checkbox"
                  checked={isAdCheck}
                  onChange={(e: any) => setIsAdCheck(e.target.checked)}
                />
                선택_광고성 정보 수신 동의{" "}
                <Link href={"/"} target="_blank" className="text-xs">
                  [약관 보기]
                </Link>
              </div>
            </div>
            <Button text="회원가입" addClassName="btn-outline" />
          </form>
        </div>
      </dialog>
    </>
  );
}
