import { z } from "zod";

export const productSchema = z.object({
  photo: z.array(z.string(), { required_error: "Photo is required" }),
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  price: z.coerce.number({
    required_error: "Price is required",
  }),
});

export type ProductType = z.infer<typeof productSchema>;

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
