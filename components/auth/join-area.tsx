import Link from "next/link";

import { PATH_NAME } from "@/lib/constants";
import FindEmailModal from "../modal/findEmail-modal";
import FindPwModal from "../modal/findpw-modal";

export default function JoinArea() {
  return (
    <div className="flex flex-col gap-8">
      <div className="w-full h-px bg-neutral-500"></div>
      <div className="flex gap-12 justify-center text-neutral-500 *:hover:cursor-pointer">
        <FindEmailModal />
        <FindPwModal />
      </div>
      <div className="flex flex-col gap-3">
        <Link
          className="btn bg-neutral-800 hover:bg-neutral-800 text-white flex h-14 items-center justify-center gap-3"
          href={PATH_NAME.JOIN}
        >
          <p className="text-lg font-semibold">
            <span className="text-yellow-300">카카오</span> 1초 회원가입
          </p>
        </Link>
      </div>
    </div>
  );
}
