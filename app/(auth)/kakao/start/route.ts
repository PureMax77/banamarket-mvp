// api routes

import { PATH_NAME } from "@/lib/constants";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const params = {
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: process.env.DOMAIN_URL + PATH_NAME.KAKAO_COMPLETE,
    response_type: "code",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseUrl}?${formattedParams}`;

  return redirect(finalUrl);
}
