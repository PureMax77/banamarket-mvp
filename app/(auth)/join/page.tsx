import Link from "next/link";
import Image from "next/image";
import KakaoImg from "@/public/kakao48.png";
import LoginArea from "@/components/auth/login-area";
import { PATH_NAME } from "@/lib/constants";
import JoinModal from "@/components/modal/join-modal";

export default function Join() {
  return (
    <div className="min-h-screen flex flex-col justify-center gap-10 py-8 px-6">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-black">바나마켓</h1>
        <div className="flex flex-col items-center">
          <h3 className="text-lg text-neutral-400">
            회원정보 입력하기 귀찮으시죠?
          </h3>
          <h2 className="text-xl font-semibold">
            카카오로 1초 만에 회원가입 하세요.
          </h2>
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <Link
          href={PATH_NAME.KAKAO_START}
          className="btn flex justify-center items-center bg-yellow-300 hover:bg-yellow-300 w-full h-28"
        >
          <Image src={KakaoImg} alt="kakao_icon" />
          <span className="ml-2 text-2xl font-black">카카오 1초 회원가입</span>
        </Link>
        <JoinModal />
      </div>
      <LoginArea />
    </div>
  );
}
