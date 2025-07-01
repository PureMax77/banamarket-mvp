import db from "@/lib/db";
import { emailMasking } from "@/lib/utils";
import { NextRequest } from "next/server";

// 아이디(이메일) 찾기용 인즈코드 확인
export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();

  // 인증코드 6자리 검증
  if (code.length !== 6) {
    return new Response(JSON.stringify({ msg: "인증번호는 6자리입니다." }), {
      status: 400,
    });
  }

  const user = await db.user.findUnique({
    where: {
      phone,
    },
    select: {
      id: true,
      email: true,
      smsToken_forEmail: true,
    },
  });

  // 해당 휴대폰번호 유저 없음
  if (!user) {
    return new Response(
      JSON.stringify({ msg: "해당 번호로 가입한 회원이 없습니다." }),
      {
        status: 400,
      }
    );
  }

  const token = user?.smsToken_forEmail;

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

  // 이상없이 모두 통과
  await db.sMSTokenForEmail.update({
    where: { id: token.id },
    data: {
      isVerified: true,
    },
  });

  // 이메일 마스킹
  const maskedEmail = emailMasking(user.email!);

  return new Response(
    JSON.stringify({
      email: maskedEmail,
    }),
    { status: 200 }
  );
}
