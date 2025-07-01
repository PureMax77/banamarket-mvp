import db from "@/lib/db";
import { getGitAccessToken, getGitUserProfile, goLogin } from "@/lib/session";
import { genRandomFourNumber } from "@/lib/utils";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    // 잘못된 url 접근이므로
    return new Response(null, { status: 400 });
  }

  const { error, access_token } = await getGitAccessToken(code);

  if (error || !access_token) {
    return new Response(null, { status: 400 });
  }

  // profile 정보 획득
  const {
    id,
    kakao_account: {
      profile: { nickname, thumbnail_image_url, profile_image_url },
      has_email,
      email,
    },
  } = await getGitUserProfile(access_token);

  // 카카오로 가입한 이력 있는지 검사
  const user = await db.user.findUnique({
    where: {
      kakao_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    // 이미 가입한 경우
    await goLogin(user.id);
    return redirect("/");
  }

  // username 중복 검사
  const alreadyUser = await db.user.findUnique({
    where: {
      username: nickname,
    },
    select: {
      id: true,
    },
  });
  const newUsername = alreadyUser
    ? `${nickname}${genRandomFourNumber().toString()}`
    : nickname;

  // 회원가입
  const newUser = await db.user.create({
    data: {
      username: newUsername,
      kakao_id: id + "",
      avatar: profile_image_url,
      avatar_thumb: thumbnail_image_url,
      ...(has_email && { email }),
      ad_agree: false, //! 추후 광고수신 동의 데이터 연동 필요
    },
    select: {
      id: true,
    },
  });
  await goLogin(newUser.id);
  return redirect("/");
}
