"use client";

import { useState } from "react";
import { EllipsisVerticalIcon, ShareIcon } from "@heroicons/react/24/solid";
import DownloadButton from "@/components/button/DownloadButton";

enum TabType {
  ING = "ing",
  COMPLETE = "complete",
}

export default function BizList() {
  const [selectedTab, setSelectedTab] = useState<TabType>(TabType.ING);

  return (
    <div className="h-screen relative bg-yellow-100 bg-opacity-50 px-4 py-6">
      <div className="flex flex-col gap-5">
        <div role="tablist" className="tabs tabs-bordered tabs-lg *:text-xl">
          <a
            role="tab"
            className={`tab ${selectedTab === TabType.ING ? "tab-active" : ""}`}
            onClick={() => setSelectedTab(TabType.ING)}
          >
            판매 중
          </a>
          <a
            role="tab"
            className={`tab ${
              selectedTab === TabType.COMPLETE ? "tab-active" : ""
            }`}
            onClick={() => setSelectedTab(TabType.COMPLETE)}
          >
            판매 완료
          </a>
        </div>
        <div className="flex flex-col p-5 bg-white border border-neutral-300 rounded-lg gap-5">
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>판매 상품 이름</span>
              <span>총 3건 주문</span>
            </div>
            <div className="flex justify-between">
              <span>2024.09.10 ~ 2024.10.24</span>
              <span>총 주문금액 0원</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-5">
              <button className="btn w-28">
                <div className="flex justify-center items-center gap-2">
                  공유하기
                  <ShareIcon className="w-5 h-5" />
                </div>
              </button>
              <button className="btn w-28">주문내역 확인</button>
            </div>
            <div className="dropdown dropdown-left dropdown-end">
              <div tabIndex={0} role="button" className="btn">
                <EllipsisVerticalIcon className="w-7 h-7" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
              >
                <li>
                  <a>Item 1</a>
                </li>
                <li>
                  <a>Item 2</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <DownloadButton />
    </div>
  );
}
