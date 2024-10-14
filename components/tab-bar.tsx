"use client";

import Link from "next/link";
import {
  HomeIcon as SolidHome,
  ChartBarSquareIcon as SolidChart,
  ChatBubbleOvalLeftEllipsisIcon as SolidChat,
  UserIcon as SolidUser,
} from "@heroicons/react/24/solid";
import {
  HomeIcon as OutlineHome,
  ChatBubbleOvalLeftEllipsisIcon as OutlineChat,
  ChartBarSquareIcon as OutLineChart,
  UserIcon as OutlineUser,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { PATH_NAME } from "@/lib/constants";

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 bg-white w-full m-screen-set grid grid-cols-4 border-neutral-200 border-t px-5 py-3">
      <Link href={PATH_NAME.HOME} className="flex flex-col items-center gap-px">
        {pathname === PATH_NAME.HOME ? (
          <SolidHome className="w-7 h-7" />
        ) : (
          <OutlineHome className="w-7 h-7" />
        )}
        <span>바나마켓</span>
      </Link>
      <Link
        href={PATH_NAME.PRICE}
        className="flex flex-col items-center gap-px"
      >
        {pathname === PATH_NAME.PRICE ? (
          <SolidChart className="w-7 h-7" />
        ) : (
          <OutLineChart className="w-7 h-7" />
        )}
        <span>시세</span>
      </Link>
      <Link
        href={PATH_NAME.CHATS}
        className="flex flex-col items-center gap-px"
      >
        {pathname === PATH_NAME.CHATS ? (
          <SolidChat className="w-7 h-7" />
        ) : (
          <OutlineChat className="w-7 h-7" />
        )}
        <span>채팅</span>
      </Link>
      <Link
        href={PATH_NAME.PROFILE}
        className="flex flex-col items-center gap-px"
      >
        {pathname === PATH_NAME.PROFILE ? (
          <SolidUser className="w-7 h-7" />
        ) : (
          <OutlineUser className="w-7 h-7" />
        )}
        <span>내정보</span>
      </Link>
    </div>
  );
}
