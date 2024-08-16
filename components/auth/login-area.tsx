import Link from "next/link";
import { PATH_NAME } from "@/lib/constants";

export default function LoginArea() {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-px bg-neutral-500 mb-10"></div>
      <div className="flex gap-12 justify-center text-neutral-500">
        이미 바나마켓 회원이신가요?
      </div>
      <div className="flex flex-col gap-3">
        <Link
          className="btn bg-neutral-200 flex h-14 items-center justify-center"
          href={PATH_NAME.LOGIN}
        >
          <p className="text-lg font-semibold">로그인하기</p>
        </Link>
      </div>
    </div>
  );
}
