import db from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();

  // 인증코드 6자리 검증
  if (code.length !== 6) {
    return new Response(JSON.stringify({ msg: "인증번호는 6자리입니다." }), {
      status: 400,
    });
  }

  const token = await db.sMSToken.findUnique({
    where: {
      phone,
    },
  });

  // 해당번호 토크 없음
  if (!token) {
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

  // 이미 인증된 토큰
  if (token.isVerified) {
    return new Response(JSON.stringify({ msg: "이미 인증이 완료됐습니다." }), {
      status: 400,
    });
  }

  // 이상없이 모두 통과
  await db.sMSToken.update({
    where: { id: token.id },
    data: {
      isVerified: true,
    },
  });
  return new Response("success", { status: 200 });
}
