import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface Props {
  href: string;
}

export default function TopBackButton({ href }: Props) {
  return (
    <div className="w-full flex justify-between">
      <Link href={href} className="cursor-pointer w-10">
        <ChevronLeftIcon className="w-10 h-10 mb-5" />
      </Link>
      <div className="w-10"></div>
    </div>
  );
}
