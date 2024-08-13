import Link from "next/link";
import KakaoImg from "@/public/kakao48.png";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export default function SignUpArea() {
  return (
    <div className="flex flex-col gap-8">
      <div className="w-full h-px bg-neutral-500"></div>
      <div className="flex gap-12 justify-center text-neutral-500 *:hover:cursor-pointer">
        <div className="flex gap-1 items-center">
          <MagnifyingGlassIcon className="w-5 h-5" /> 아이디/비밀번호 찾기
        </div>
        <div className="flex gap-1 items-center">
          <ShoppingCartIcon className="w-5 h-5" /> 비회원 주문/배송 조회
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          className="btn bg-neutral-800 hover:bg-neutral-800 text-white flex h-14 items-center justify-center gap-3"
          href={"/kakao/start"}
        >
          <p className="text-lg font-semibold">
            <span className="text-yellow-300">카카오</span> 1초 회원가입
          </p>
        </Link>
      </div>
    </div>
  );
}
