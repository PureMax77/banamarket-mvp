import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import OrderSearchClient from "./ordersearch-client";

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

export const metadata = {
  title: "주문배송",
};

export default async function OrderSearch() {
  // 서버 컴포넌트에서 세션 확인
  const user = await getUser();
  
  return <OrderSearchClient />;
}