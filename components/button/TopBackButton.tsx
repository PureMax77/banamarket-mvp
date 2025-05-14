import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  href: string;
  title?: string;
}

export default function TopBackButton({ href, title = "" }: Props) {
  return (
    <div className="flex items-center px-4 py-3 border-b bg-white mb-4">
      <Link href={href} className="mr-2">
        <ChevronLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-medium">{title}</h1>
    </div>
  );
}
