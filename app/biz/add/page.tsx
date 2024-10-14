"use client";

import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { productSchema, ProductType } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUploadUrl } from "./actions";
import Input from "@/components/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getNextDayStartTime } from "@/lib/utils";

export default function BizAdd() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(getNextDayStartTime(7)));
  const [isEndless, setIsEndless] = useState(false);

  const [value, setValue2] = useState({
    startDate: null,
    endDate: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    const file = files[0];

    // Check if the file is an image
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];
    if (!validImageTypes.includes(file.type)) {
      alert("이미지 파일이 아닙니다.");
      return;
    }

    // Check if the file size is less than 3MB
    const maxSizeInMB = 3;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      alert("3MB 이하의 이미지를 사용해주세요.");
      return;
    }

    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setValue(
        "photo",
        `https://imagedelivery.net/S5EmZfh9mNC3-3xmENYiiA/${id}`
      );
    } else {
      alert("이미지 업로드에 실패했습니다");
      return;
    }

    // 브라우저에 올라간 이미지 메모리 주소URL
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFile(file);
  };

  const onValid = async () => {
    // await onSubmit();
  };

  return (
    <div className="bg-yellow-100 bg-opacity-50 px-4 py-6">
      <form action={onValid} className="flex flex-col gap-5 mb-20">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {!preview && (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {errors.photo?.message}
              </div>
            </>
          )}
        </label>
        {/* label을 눌러도 input이 눌러지니까 숨김 */}
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
        <Input
          required
          placeholder="판매 상품 이름 입력"
          type="text"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />
        <div className="flex flex-col gap-2 justify-center border border-neutral-300 bg-white p-4 rounded-lg">
          <div>판매 기간 설정</div>
          <div className="flex items-center gap-4">
            <div>시작</div>
            <DatePicker
              selected={startDate}
              onChange={(date: any) => setStartDate(date)}
              showTimeSelect // 시간 선택 가능하게 함
              dateFormat="Pp" // 날짜와 시간을 모두 표시하는 포맷
              // popperPlacement="top-end"
              className="p-2 border rounded hover:cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-4">
            <div>종료</div>
            {!isEndless && (
              <DatePicker
                selected={endDate}
                onChange={(date: any) => setEndDate(date)}
                showTimeSelect // 시간 선택 가능하게 함
                dateFormat="Pp" // 날짜와 시간을 모두 표시하는 포맷
                // popperPlacement="top-end"
                className="p-2 border rounded hover:cursor-pointer"
              />
            )}
            <button
              type="button"
              className="btn"
              onClick={() => setIsEndless((a) => !a)}
            >
              {isEndless ? "종료 시점 설정" : "상시 판매"}
            </button>
          </div>
        </div>
        <textarea
          className="textarea border border-neutral-300"
          placeholder="상품설명"
          rows={6}
        ></textarea>
        <label className="input input-bordered flex items-center gap-2">
          기본가격
          <input type="text" className="grow" placeholder="원(KRW)" />
        </label>
        <button className="btn btn-square btn-outline border-neutral-300 w-full group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 stroke-neutral-500 group-hover:stroke-white transition-colors duration-200"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16M4 12h16"
            />
          </svg>
        </button>
        <textarea
          className="textarea border border-neutral-300"
          placeholder="주문완료문구"
          rows={6}
        ></textarea>
        <div className="flex justify-between">
          <button className="btn btn-active w-[48%]" type="button">
            우선 저장하기
          </button>
          <button className="btn btn-active w-[48%]">판매 시작하기</button>
        </div>
      </form>
    </div>
  );
}
