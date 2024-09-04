import db from "@/lib/db";
import { generateRandomPw } from "@/lib/utils";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import twilio from "twilio";

// 비밀번호 찾기용 인즈코드 확인
export async function POST(request: NextRequest) {
  const { email, phone, code } = await request.json();

  // 인증코드 6자리 검증
  if (code.length !== 6) {
    return new Response(JSON.stringify({ msg: "인증번호는 6자리입니다." }), {
      status: 400,
    });
  }

  const user = await db.user.findUnique({
    where: {
      email,
      phone,
    },
    select: {
      id: true,
      smsToken_forPw: true,
    },
  });

  // 해당 휴대폰번호 유저 없음
  if (!user) {
    return new Response(
      JSON.stringify({ msg: "해당 정보와 일치하는 회원이 없습니다." }),
      {
        status: 400,
      }
    );
  }

  const token = user?.smsToken_forPw;

  // 해당번호 토크 없거나 이미 인증된 토큰
  if (!token || token.isVerified) {
    return new Response(
      JSON.stringify({ msg: "먼저 인증번호를 요청하세요." }),
      {
        status: 400,
      }
    );
  }

  // 인증요청 5분 Timeout 체크
  const now = new Date(); // 현재 시간
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000); // 현재 시간에서 5분 전
  if (token.updated_at < fiveMinAgo) {
    // 5분 초과함
    return new Response(
      JSON.stringify({
        msg: "인증이 만료됐습니다. 인증번호를 다시 요청하세요.",
      }),
      {
        status: 400,
      }
    );
  }

  // 인증토큰 틀림
  if (token.token !== code) {
    return new Response(
      JSON.stringify({ msg: "인증번호가 올바르지 않습니다." }),
      {
        status: 400,
      }
    );
  }

  // 문자 보내기 함수
  const sendSMS = async (newPw: string) => {
    // 문자 보내기
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      body: `[바나마켓] 새로운 비밀번호는 ${newPw} 입니다. 로그인 후 마이페이지에서 비밀번호를 변경하세요.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: "+82" + phone.substring(1),
    });
  };

  // 이상없이 모두 통과
  const newPw = generateRandomPw(); // 10자리 비번
  const hashedPassword = await bcrypt.hash(newPw, 12);

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  await sendSMS(newPw);

  await db.sMSTokenForPw.update({
    where: { id: token.id },
    data: {
      isVerified: true,
    },
  });

  return new Response("success", { status: 200 });
}
