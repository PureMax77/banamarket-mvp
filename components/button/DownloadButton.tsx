import { PATH_NAME } from "@/lib/constants";
import Link from "next/link";

export default function DownloadButton() {
  return (
    <Link
      href={PATH_NAME.BIZLISTDOWN}
      className="bg-yellow-400 flex items-center justify-center rounded-full size-16 absolute bottom-24 right-6 transition-colors hover:bg-yellow-300"
    >
      다운로드
    </Link>
  );
}
