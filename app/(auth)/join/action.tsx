"use server";
import bcrypt from "bcrypt";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PhoneNumberRegex,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import { goLogin } from "@/lib/session";
import { generateNickname } from "@/lib/utils";

// 한글만 포함된 문자열인지 검증하는 정규식
const koreanRegex = /^[가-힣]+$/;

const checkPassword = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

// 필수항목 동의 체크
const checkTerm = ({ adult_check, term_check, info_check }: any) =>
  !!adult_check && !!term_check && !!info_check;

// 닉네임 생성
const getUsername = async () => {
  const username = generateNickname();
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  if (user) {
    // 이미 해당 닉네임 중복으로 다시 생성
    return getUsername();
  } else {
    return username;
  }
};

const formSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 8~20자리입니다.")
      .max(PASSWORD_MAX_LENGTH, "비밀번호는 8~20자리입니다.")
      .refine(
        (value) => {
          // 영문, 숫자, 특수문자를 각각 최소 1개씩 포함하는지 확인
          const hasLetter = /[a-zA-Z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[~!@#$%^&*()_+-=`]/.test(value);

          return hasLetter && hasNumber && hasSpecialChar;
        },
        {
          message:
            "영문,숫자,특수문자(~!@#$%^&*()_+-=`) 최소 1개씩 필요합니다.",
        }
      ),
    confirm_password: z.string(),
    name: z
      .string()
      .min(NAME_MIN_LENGTH, "이름은 2~6글자입니다.")
      .max(NAME_MAX_LENGTH, "이름은 2~6글자입니다.")
      .refine(
        (value) => koreanRegex.test(value),
        "이름은 정상적인 한글로만 가능합니다."
      ),
    phone: z
      .string()
      .refine(
        (phone) => PhoneNumberRegex.test(phone),
        "잘못된 전화번호입니다."
      ),
    adult_check: z.coerce.boolean(),
    term_check: z.coerce.boolean(),
    info_check: z.coerce.boolean(),
    ad_check: z.coerce.boolean(),
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "해당 이메일은 이미 사용중입니다.",
        path: ["email"],
        fatal: true, // 해당 에러 발생시 남은 검증들은 하지 않기 위해
      });
      z.NEVER; // 해당 에러 발생시 남은 검증들은 하지 않기 위해
    }
  })
  .refine(checkPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirm_password"], // 에러 발생 지점 설정
  })
  .superRefine(async ({ phone }, ctx) => {
    const smsToken = await db.sMSToken.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
        isVerified: true,
        updated_at: true,
      },
    });

    // 토큰생성기록 없음
    if (!smsToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "휴대폰 인증이 필요합니다.",
        path: ["phone"],
        fatal: true, // 해당 에러 발생시 남은 검증들은 하지 않기 위해
      });
      z.NEVER; // 해당 에러 발생시 남은 검증들은 하지 않기 위해
      return;
    }

    // 인증요청 5분 Timeout 체크
    const now = new Date(); // 현재 시간
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000); // 현재 시간에서 5분 전
    // 5분 초과함
    if (smsToken.updated_at < fiveMinAgo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "휴대폰 인증이 만료됐습니다. 인증을 다시 시도하세요.",
        path: ["term_check"], // 인증다하고 만료된 경우를 대비해서
        fatal: true, // 해당 에러 발생시 남은 검증들은 하지 않기 위해
      });
      z.NEVER; // 해당 에러 발생시 남은 검증들은 하지 않기 위해
      return;
    }

    if (!smsToken.isVerified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "휴대폰 인증이 필요합니다.",
        path: ["phone"],
        fatal: true, // 해당 에러 발생시 남은 검증들은 하지 않기 위해
      });
      z.NEVER; // 해당 에러 발생시 남은 검증들은 하지 않기 위해
    }
  })
  .refine(checkTerm, {
    message: "필수항목에 동의가 필요합니다.",
    path: ["term_check"], // 에러 발생 지점 설정
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    adult_check: formData.get("adult_check"),
    term_check: formData.get("term_check"),
    info_check: formData.get("info_check"),
    ad_check: formData.get("ad_check"),
  };

  const result = await formSchema.safeParseAsync(data);

  if (!result.success) {
    return result.error.flatten();
  } else {
    // hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    // getUsername
    const username = await getUsername();

    // save the user to db
    const user = await db.user.create({
      data: {
        username,
        name: result.data.name,
        email: result.data.email,
        password: hashedPassword,
        phone: result.data.phone,
        ad_agree: result.data.ad_check,
      },
      select: {
        id: true,
      },
    });

    // delete smsToken
    await db.sMSToken.delete({
      where: {
        phone: result.data.phone,
      },
    });

    await goLogin(user.id, "/");
  }
}
