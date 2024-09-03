import { PhoneNumberRegex } from "@/lib/constants";
import db from "@/lib/db";
import { NextRequest } from "next/server";
import crypto from "crypto";
import twilio from "twilio";

// 아이디(이메일) 찾기용 인증코드 발송
export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();

  // 휴대폰번호 규격 맞는지
  const isCorrectNumber = PhoneNumberRegex.test(phoneNumber);

  if (!isCorrectNumber) {
    return new Response(JSON.stringify({ msg: "잘못된 휴대폰번호입니다." }), {
      status: 400,
    });
  }

  // 해당번호 유저 조회
  const user = await db.user.findUnique({
    where: {
      phone: phoneNumber,
    },
    select: {
      id: true,
      kakao_id: true,
      smsToken_forEmail: true,
    },
  });

  if (!user) {
    return new Response(
      JSON.stringify({ msg: "해당 번호로 가입한 회원이 없습니다." }),
      {
        status: 400,
      }
    );
  }

  // 카카오 가입 유저
  if (user.kakao_id) {
    return new Response(
      JSON.stringify({
        msg: "카카오로 가입한 계정입니다. 카카오 간편로그인을 이용해주세요.",
      }),
      {
        status: 400,
      }
    );
  }

  // 문자 보내기 함수
  const sendSMS = async () => {
    const token = crypto.randomInt(100000, 999999).toString();

    // 문자 보내기
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      body: `[바나마켓] 인증 코드는 [${token}] 입니다.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: "+82" + phoneNumber.substring(1),
    });

    return token;
  };

  // 기존 토큰
  const token = user.smsToken_forEmail;

  if (token) {
    const now = new Date(); // 현재 시간

    // 인증 완료(verified)된지 10분 이내에는 재인증 불가
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 현재 시간에서 10분 전
    if (token.isVerified && token.updated_at > tenMinutesAgo) {
      return new Response(
        JSON.stringify({
          msg: "이미 아이디 확인하셨습니다. 10분 후에 다시 시도해 주세요.",
        }),
        {
          status: 400,
        }
      );
    }

    // 24시간 요청 5번이내 제한
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 현재 시간에서 24시간 전

    if (token.count > 4) {
      // 요청 5번 햇음
      if (token.updated_at > twentyFourHoursAgo) {
        // 24시간 이내임
        return new Response(
          JSON.stringify({
            msg: "인증 요청 제한 횟수를 초과했습니다. 24시간 후에 다시 시도해 주세요.",
          }),
          {
            status: 400,
          }
        );
      } else {
        // 24시간 지남
        const newToken = await sendSMS();
        await db.sMSTokenForEmail.update({
          where: {
            userId: user.id,
          },
          data: {
            count: 1,
            isVerified: false,
            token: newToken,
          },
        });
        return new Response("Success", { status: 200 });
      }
    } else {
      // 요청 5번 미만임
      const newToken = await sendSMS();
      await db.sMSTokenForEmail.update({
        where: {
          userId: user.id,
        },
        data: {
          count: token.count + 1,
          isVerified: false,
          token: newToken,
        },
      });
      return new Response("Success", { status: 200 });
    }
  } else {
    // 기존 토큰없고 첫요청
    const newToken = await sendSMS();
    await db.sMSTokenForEmail.create({
      data: {
        isVerified: false,
        count: 1,
        token: newToken,
        userId: user.id,
      },
    });
    return new Response("Success", { status: 200 });
  }
}
