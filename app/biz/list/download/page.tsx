import TopBackButton from "@/components/button/TopBackButton";
import { PATH_NAME } from "@/lib/constants";

export default function BizListDownload() {
  return (
    <div className="h-screen bg-yellow-100 bg-opacity-50 px-4 py-6">
      <TopBackButton href={PATH_NAME.BIZLIST} />
      <div className="flex flex-col p-5 bg-white border border-neutral-300 rounded-lg ">
        <p>판매 중</p>
        <p className="text-lg">판매 상품 이름</p>
      </div>
    </div>
  );
}
