import { PhoneNumberRegex } from "@/lib/constants";
import db from "@/lib/db";
import { NextRequest } from "next/server";
import crypto from "crypto";
import twilio from "twilio";

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
  });
  if (user) {
    return new Response(JSON.stringify({ msg: "이미 가입된 번호입니다." }), {
      status: 400,
    });
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
      body: `Your Karrot verification code is: ${token}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: "+82" + phoneNumber.substring(1),
    });

    return token;
  };

  // 기존 토큰 조회
  const token = await db.sMSToken.findUnique({
    where: {
      phone: phoneNumber,
    },
  });

  if (token) {
    // 24시간 요청 5번이내 제한
    const now = new Date(); // 현재 시간
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
        await db.sMSToken.update({
          where: {
            phone: phoneNumber,
          },
          data: {
            count: 1,
            token: newToken,
          },
        });
        return new Response("Success", { status: 200 });
      }
    } else {
      // 요청 5번 미만임
      const newToken = await sendSMS();
      await db.sMSToken.update({
        where: {
          phone: phoneNumber,
        },
        data: {
          count: token.count + 1,
          token: newToken,
        },
      });
      return new Response("Success", { status: 200 });
    }
  } else {
    // 기존 토큰없고 첫요청
    const newToken = await sendSMS();
    await db.sMSToken.create({
      data: {
        phone: phoneNumber,
        count: 1,
        token: newToken,
      },
    });
    return new Response("Success", { status: 200 });
  }
}
