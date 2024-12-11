import { z } from "zod";

export const productSchema = z.object({
  photo: z.array(z.string()),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  completionMessage: z.string().optional(),
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
