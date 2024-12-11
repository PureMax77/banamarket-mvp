"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";
import { getUploadUrl } from "./actions";
import { formatStrToNumber, getNextDayStartTime } from "@/lib/utils";
import { PATH_NAME } from "@/lib/constants";
import ImageUpload from "@/components/image-upload";
import DateSelection from "@/components/date-selection";
import ProductOptions from "@/components/product-options";
import TopBackButton from "@/components/button/TopBackButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface IOption {
  title: string;
  price: string;
}

const initOption: IOption = { title: "", price: "0" };

export default function BizAdd() {
  const [preview, setPreview] = useState<string[]>([]);
  const [uploadUrl, setUploadUrl] = useState<string[]>([]);
  const [file, setFile] = useState<File[] | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(getNextDayStartTime(7))
  );
  const [isEndless, setIsEndless] = useState(false);
  const [options, setOptions] = useState<IOption[]>([initOption]);

  const form = useForm<ProductType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      photo: [],
      description: "",
      price: 0,
      completionMessage: "",
    },
  });

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }

    const fileList = Array.from(files);

    // Check if the file is an image
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];

    for (const file of fileList) {
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
    }

    const urlList = await getUploadUrl(fileList.length);
    if (urlList.length > 0) {
      const ids: string[] = [];
      const urls: string[] = [];
      urlList.forEach((data) => {
        ids.push(`https://imagedelivery.net/S5EmZfh9mNC3-3xmENYiiA/${data.id}`);
        urls.push(data.uploadURL);
      });

      setUploadUrl(urls);
      form.setValue("photo", ids);
    } else {
      alert("이미지 업로드에 실패했습니다");
      return;
    }

    // 브라우저에 올라간 이미지 메모리 주소URL
    const previewUrls = fileList.map((file) => URL.createObjectURL(file));
    setPreview(previewUrls);
    setFile(fileList);
  };

  const handleOptionChange = (
    index: number,
    field: keyof IOption,
    value: any
  ) => {
    const newValue = field === "price" ? formatStrToNumber(value) : value;
    setOptions((prev) => {
      const newOptions = JSON.parse(JSON.stringify(prev));
      newOptions[index][field] = newValue;
      return newOptions;
    });
  };

  const removeOption = (index: number) => {
    if (options.length < 2) {
      alert("최소 1개 이상의 옵션이 필요합니다.");
      return;
    }
    setOptions((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductType) => {
    console.log(data);
    // Implement your submit logic here
  };

  return (
    <div className="bg-yellow-100 bg-opacity-50 px-4 py-6">
      <TopBackButton href={PATH_NAME.BIZ} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mb-20"
        >
          <ImageUpload
            preview={preview}
            onImageChange={onImageChange}
            error={form.formState.errors.photo?.message}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="판매 상품 제목 입력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DateSelection
            startDate={startDate!}
            endDate={endDate!}
            isEndless={isEndless}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setIsEndless={setIsEndless}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="상품설명" rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ProductOptions
            options={options}
            handleOptionChange={handleOptionChange}
            removeOption={removeOption}
            addOption={() =>
              setOptions([...options, JSON.parse(JSON.stringify(initOption))])
            }
          />
          <FormField
            control={form.control}
            name="completionMessage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="주문완료문구(선택사항)"
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button type="button" className="w-[48%]">
              우선 저장하기
            </Button>
            <Button type="submit" className="w-[48%]">
              판매 시작하기
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
