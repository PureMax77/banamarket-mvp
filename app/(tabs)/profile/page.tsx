import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { PATH_NAME } from "@/lib/constants";

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
  title: "내정보",
};

export default async function Profile() {
  const user = await getUser();

  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* 고정된 헤더 */}
      <header className="fixed m-screen-set top-0 left-0 right-0 h-16 bg-white p-4 z-10 flex justify-between items-center border-neutral-200 border-b">
        <h1 className="text-lg font-bold text-center">마이페이지</h1>
        <form action={logOut}>
          <button>
            <div className="flex items-center">
              로그아웃
              <ArrowRightStartOnRectangleIcon className="w-7 h-7" />
            </div>
          </button>
        </form>
      </header>

      {/* 스크롤 가능한 콘텐츠 */}
      <main className="pt-16 p-4 h-screen bg-white">
        <div className="py-4 text-lg flex flex-col gap-6">
          <div className="flex flex-col gap-4 *:cursor-pointer">
            <div className="text-yellow-400 font-bold !cursor-default">
              나의거래
            </div>
            <div>찜한 상품</div>
            <Link href={PATH_NAME.ORDERSEARCH}>주문/배송</Link>
          </div>
          <div className="flex flex-col gap-4 *:cursor-pointer">
            <div className="text-yellow-400 font-bold !cursor-default">
              기타
            </div>
            <div>약관 및 정책</div>
            <div>고객센터</div>
            <Link href={PATH_NAME.BIZ}>판매자 페이지로 이동</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
