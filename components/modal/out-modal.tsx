"use client";

import { useRef } from "react";
import { ArrowUturnLeftIcon as OutlineBack } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { PATH_NAME } from "@/lib/constants";

export default function OutModal() {
  const router = useRouter();

  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="flex flex-col items-center gap-px outline-none"
        onClick={() => dialogRef.current?.showModal()}
      >
        <OutlineBack className="w-7 h-7 transform scale-y-[-1]" />
        <span>나가기</span>
      </button>
      <dialog ref={dialogRef} id="join_modal" className="modal">
        <div className="modal-box w-full max-w-80 flex justify-center items-center flex-col gap-5">
          <div>
            판매자 페이지에서 나가시겠습니까?
            <br />
            작성중인 내용은 저장되지 않습니다.
          </div>
          <div className="flex gap-5">
            <button
              className="btn w-28"
              onClick={() => router.push(PATH_NAME.PROFILE)}
            >
              네, 나갈래요
            </button>
            <form method="dialog">
              <button className="btn w-28">아니요</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
