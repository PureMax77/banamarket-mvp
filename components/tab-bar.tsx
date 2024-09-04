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

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full mx-auto max-w-screen-sm grid grid-cols-4 border-neutral-200 border-t px-5 py-3">
      <Link href="/" className="flex flex-col items-center gap-px">
        {pathname === "/" ? (
          <SolidHome className="w-7 h-7" />
        ) : (
          <OutlineHome className="w-7 h-7" />
        )}
        <span>바나마켓</span>
      </Link>
      <Link href="/price" className="flex flex-col items-center gap-px">
        {pathname === "/price" ? (
          <SolidChart className="w-7 h-7" />
        ) : (
          <OutLineChart className="w-7 h-7" />
        )}
        <span>시세</span>
      </Link>
      <Link href="/chats" className="flex flex-col items-center gap-px">
        {pathname === "/chats" ? (
          <SolidChat className="w-7 h-7" />
        ) : (
          <OutlineChat className="w-7 h-7" />
        )}
        <span>채팅</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-px">
        {pathname === "/profile" ? (
          <SolidUser className="w-7 h-7" />
        ) : (
          <OutlineUser className="w-7 h-7" />
        )}
        <span>내정보</span>
      </Link>
    </div>
  );
}
