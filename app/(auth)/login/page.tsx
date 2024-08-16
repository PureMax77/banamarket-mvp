"use client";

import Input from "@/components/input";
import Button from "@/components/button";
import { PASSWORD_MIN_LENGTH, PATH_NAME } from "@/lib/constants";
import { useFormState } from "react-dom";
import { login } from "./actions";
import Link from "next/link";
import Image from "next/image";
import KakaoImg from "@/public/kakao48.png";
import JoinArea from "@/components/auth/join-area";

export default function Login() {
  const [state, dispatch] = useFormState(login, null);
  return (
    <div className="min-h-screen flex flex-col justify-center gap-10 py-8 px-6">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-black">바나마켓</h1>
        <div className="flex flex-col items-center">
          <h3 className="text-lg text-neutral-400">회원가입 필요 없는</h3>
          <h2 className="text-xl font-semibold">간편 로그인을 이용해보세요</h2>
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <Link
          href={PATH_NAME.KAKAO_START}
          className="btn flex justify-center items-center bg-yellow-300 hover:bg-yellow-300 w-full h-28"
        >
          <Image src={KakaoImg} alt="kakao_icon" />
          <span className="ml-2 text-2xl font-black">카카오 간편 로그인</span>
        </Link>
        <button className="text-neutral-500 mt-4 text-lg ">
          이메일 로그인
        </button>
      </div>
      {/* <form action={dispatch} className="flex flex-col gap-3">
        <Input
          name="id"
          type="text"
          placeholder="아이디"
          required
          // errors={state?.fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          required
          minLength={PASSWORD_MIN_LENGTH}
          // errors={state?.fieldErrors.password}
        />
        <Button text="로그인" />
      </form> */}
      <JoinArea />
    </div>
  );
}
