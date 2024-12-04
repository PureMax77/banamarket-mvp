"use client";

import Link from "next/link";
import {
  PencilSquareIcon as SolidPencil,
  ClipboardDocumentListIcon as SolidList,
} from "@heroicons/react/24/solid";
import {
  PencilSquareIcon as OutlinePencil,
  ClipboardDocumentListIcon as OutlineList,
  ArrowUturnLeftIcon as OutlineBack,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { PATH_NAME } from "@/lib/constants";
import OutModal from "./modal/out-modal";

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 bg-white w-full m-screen-set grid grid-cols-3 border-neutral-200 border-t px-5 py-3">
      <Link href={PATH_NAME.BIZ} className="flex flex-col items-center gap-px">
        {pathname === PATH_NAME.BIZADD || pathname === PATH_NAME.BIZ ? (
          <SolidPencil className="w-7 h-7" />
        ) : (
          <OutlinePencil className="w-7 h-7" />
        )}
        <span>상품등록</span>
      </Link>
      <Link
        href={PATH_NAME.BIZLIST}
        className="flex flex-col items-center gap-px"
      >
        {pathname === PATH_NAME.BIZLIST ? (
          <SolidList className="w-7 h-7" />
        ) : (
          <OutlineList className="w-7 h-7" />
        )}
        <span>주문관리</span>
      </Link>
      <OutModal />
    </div>
  );
}
