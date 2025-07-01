import { z } from "zod";

// API에 전송될 옵션 타입 (숫자)
export const productOptionSchema = z.object({
  title: z.string(),
  price: z.number(),
  discount: z.number(),
});

// 폼 입력용 옵션 타입 (문자열)
export const productOptionFormSchema = z.object({
  title: z.string(),
  price: z.string(),
  discount: z.string(),
});

export const productSchema = z.object({
  photo: z.array(z.string()),
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  options: z.array(productOptionFormSchema),
});

export type ProductType = z.infer<typeof productSchema>;
export type ProductOptionType = z.infer<typeof productOptionSchema>;
export type ProductOptionFormType = z.infer<typeof productOptionFormSchema>;

export interface IUploadResult {
  id: string;
  uploadURL: string;
}
export interface IUploadRes {
  success: boolean;
  result: IUploadResult;
  errors: {
    code: number;
    message: string;
  }[];
  messages: {
    code: number;
    message: string;
  }[];
}
