import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Biz() {
  return (
    <div className="h-screen bg-yellow-100 bg-opacity-50 px-4 py-6">
      <div className="flex flex-col gap-4 *:w-full *:border *:border-neutral-200 *:h-16 *:flex *:justify-center *:items-center *:bg-white *:text-2xl *:cursor-pointer hover:*:bg-neutral-200">
        <Button className="text-black">임시 저장한 주문 페이지1</Button>
        <Button className="text-black">임시 저장한 주문 페이지2</Button>

        <Button asChild className="text-black">
          <Link href="/biz/add">새로 만들기</Link>
        </Button>
      </div>
    </div>
  );
}
