"use server";

import db from "@/lib/db";
import z from "zod";
import bcrypt from "bcrypt";
import { goLogin } from "@/lib/session";

// const checkUser = async ({ email, password }: any) => {
//   // 해당 메일 유저 있는지 검증
//   const user = await db.user.findUnique({
//     where: {
//       email,
//     },
//     select: {
//       id: true,
//     },
//   });
//   return Boolean(user);
// };

const formSchema = z.object({
  email: z
    .string({
      required_error: "이메일이 필요합니다.",
    })
    .email("올바른 이메일 형식이 아닙니다.")
    .toLowerCase(),
  password: z.string({
    required_error: "비밀번호가 필요합니다.",
  }),
});
// .refine(checkUser, {
//   message: "이메일 또는 비밀번호가 올바르지 않습니다.",
//   path: ["password"], // 에러 발생 지점 설정
// });

export const login = async (prevState: any, formData: FormData) => {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // safeParseAsync = spa
  const result = await formSchema.spa(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    // 해당 이메일 유저 없으면 에러
    if (!user) {
      return {
        fieldErrors: {
          password: ["이메일 또는 비밀번호가 올바르지 않습니다."],
          email: [],
        },
      };
    }

    // if the user is found, check the password hash
    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? "xxxx"
    );
    // log the user in
    if (ok) {
      await goLogin(user!.id, "/");
    } else {
      return {
        fieldErrors: {
          password: ["이메일 또는 비밀번호가 올바르지 않습니다."],
          email: [],
        },
      };
    }
  }
};
