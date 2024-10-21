"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { IUploadRes, IUploadResult, productSchema } from "./schema";

export async function uploadProduct(formData: FormData) {
  const data = {
    photo: formData.get("photo"),
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };

  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      // const product = await db.product.create({
      //   data: {
      //     title: result.data.title,
      //     description: result.data.description,
      //     price: result.data.price,
      //     photo: [result.data.photo],
      //     user: {
      //       connect: {
      //         id: session.id,
      //       },
      //     },
      //   },
      //   select: {
      //     id: true,
      //   },
      // });
      // redirect(`/products/${product.id}`);
    }
  }
}

/**
 * 이미지 업로드 url 받아오기
 * @param count 이미지 개수
 * @returns
 */
export async function getUploadUrl(count: number): Promise<IUploadResult[]> {
  let resList: IUploadResult[] = [];

  try {
    for (let i = 0; i < count; i++) {
      const response = await fetch(
        `
        https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
          },
        }
      );
      const data: IUploadRes = await response.json();
      const { success, result, errors, messages } = data;
      if (success) {
        resList.push(result);
      } else {
        console.error("Get upload imageUrl fail: " + JSON.stringify(errors));
        console.error(
          "Get upload imageUrl fail msg: " + JSON.stringify(messages)
        );
        break; // error occurred, stop uploading
      }
    }

    if (resList.length === count) {
      return resList;
    } else {
      return [];
    }
  } catch (e) {
    console.error("Get upload imageUrl error: " + e);
    return [];
  }
}
