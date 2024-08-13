// middleware는 빠른 작동을 위해 Nodejs가 아닌 경량화 버전의 edge runtime에 실행됨

import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

// array가 아닌 object에서 key가 있는지 없는지 찾는게 더 빠름
// 로그인 안 됐을 때 들어가지면 안 되는 페이지
const privateOnlyUrls: Routes = {
  "/profile": true,
};
// 로그인 됐을 때 들어가지면 안 되는 페이지
const publicOnlyUrls: Routes = {
  "/login": true,
  "/create-account": true,
  "/kakao/start": true,
  "/kakao/complete": true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  // 로그인이 필요한 페이지에 접근시도중인지
  const exists_Private = privateOnlyUrls[request.nextUrl.pathname];
  const exists_Public = publicOnlyUrls[request.nextUrl.pathname];

  if (!session.id) {
    // 로그인 안됨
    if (exists_Private) {
      // public 페이지 아닌곳으로 접근
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // 로그인 됨
    if (exists_Public) {
      // public에 접근
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  // page 요청 뿐만 아니라 api, static 등등 모든 요청을 통과하므로 아래 것들을 제외하라는 정규식
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
