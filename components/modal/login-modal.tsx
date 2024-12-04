"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../button";
import Input from "../input";
import { useFormState } from "react-dom";
import { login } from "@/app/(auth)/login/actions";

export default function LoginModal() {
  const [state, dispatch] = useFormState(login, null);

  // 에러메시지 초기화 용
  const [isFirst, setIsFirst] = useState(true);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 모달 닫힐때 clear 용
  useEffect(() => {
    const dialog = dialogRef.current;

    // 여기에 다이얼로그가 닫힐 때 실행할 로직을 추가할 수 있습니다.
    const handleDialogClose = () => {
      if (formRef.current) formRef.current.reset();
      setIsFirst(true);
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
            ref={formRef}
            action={(formData) => {
              setIsFirst(false);
              dispatch(formData);
            }}
            className="flex flex-col gap-3 max-w-lg w-full"
          >
            <h3 className="font-bold text-lg mb-2">이메일 로그인</h3>
            <Input
              name="email"
              type="email"
              placeholder="아이디(이메일)"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="비밀번호"
              errors={isFirst ? undefined : state?.fieldErrors.password}
              required
            />
            <Button text="로그인" className="btn-outline bg-black text-white" />
          </form>
        </div>
      </dialog>
    </>
  );
}
