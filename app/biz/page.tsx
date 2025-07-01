"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";
import { getUploadUrl, uploadProduct } from "./actions";
import { formatStrToNumber, getNextDayStartTime } from "@/lib/utils";
import { PATH_NAME } from "@/lib/constants";
import ImageUpload from "@/components/image-upload";
import DateSelection from "@/components/date-selection";
import ProductOptions from "@/components/product-options";
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
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface IOption {
  title: string;
  price: string;
  discount: string;
}

const initOption: IOption = { title: "", price: "0", discount: "0" };

export default function Biz() {
  const router = useRouter();

  const [preview, setPreview] = useState<string[]>([]);
  const [uploadUrl, setUploadUrl] = useState<string[]>([]);
  const [file, setFile] = useState<File[] | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(getNextDayStartTime(7))
  );
  const [isEndless, setIsEndless] = useState(false);
  const [options, setOptions] = useState<IOption[]>([initOption]);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const form = useForm<ProductType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      photo: [],
      description: "",
      startDate: new Date(),
      endDate: new Date(getNextDayStartTime(7)),
      options: [{ title: "", price: "0", discount: "0" }],
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
    const newValue =
      field === "price" || field === "discount"
        ? formatStrToNumber(value)
        : value;
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
    setSubmitLoading(true);

    // 옵션의 문자열 값을 숫자로 변환
    const formattedOptions = options.map((option) => ({
      title: option.title,
      price: parseInt(option.price) || 0,
      discount: parseInt(option.discount) || 0,
    }));

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("startDate", data.startDate.toISOString());
    if (data.endDate) {
      formData.append("endDate", data.endDate.toISOString());
    }
    formData.append("options", JSON.stringify(formattedOptions));

    data.photo.forEach((photo) => {
      formData.append("photo", photo);
    });

    try {
      // 이미지 업로드
      if (file && uploadUrl.length > 0) {
        const uploadPromises = file.map((file, index) => {
          const fileFormData = new FormData();
          fileFormData.append("file", file);

          return fetch(uploadUrl[index], {
            method: "POST",
            body: fileFormData,
          });
        });
        await Promise.all(uploadPromises);
      }

      // 상품 등록
      const result = await uploadProduct(formData);

      if (result.success) {
        router.push(PATH_NAME.BIZLIST);
      } else if (result.error) {
        console.error("Error creating product:", result.error);
      }
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-yellow-100 bg-opacity-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b bg-white">
        <h1 className="text-xl font-medium">상품 등록</h1>
      </div>
      
      <div className="px-4 py-6">
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
                    <Input
                      className="bg-white"
                      placeholder="판매 상품 제목 입력"
                      {...field}
                    />
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
                    <Textarea
                      className="bg-white"
                      placeholder="상품설명"
                      rows={6}
                      {...field}
                    />
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

            <div className="flex justify-center">
              <Button
                disabled={submitLoading}
                type="submit"
                className="w-full text-lg h-12"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    게시중...
                  </>
                ) : (
                  "판매 시작하기"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
