// api routes

import { redirect } from "next/navigation";

export async function GET() {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const params = {
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: process.env.DOMAIN_URL + "/kakao/complete",
    response_type: "code",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseUrl}?${formattedParams}`;

  return redirect(finalUrl);
}
