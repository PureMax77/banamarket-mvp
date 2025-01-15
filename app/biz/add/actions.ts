"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { IUploadRes, IUploadResult, productSchema } from "./schema";

export async function uploadProduct(formData: FormData) {
  const data = {
    photo: formData.getAll("photo").map((item) => item.toString()),
    title: formData.get("title")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    startDate: new Date(formData.get("startDate")?.toString() || new Date()),
    endDate: formData.get("endDate")
      ? new Date(formData.get("endDate")?.toString() || "")
      : undefined,
    options: JSON.parse(formData.get("options")?.toString() || "[]").map(
      (option: any) => ({
        title: option.title,
        price: option.price + "",
        discount: option.discount + "",
      })
    ),
    final_description: formData.get("final_description")?.toString(),
  };

  const result = productSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  try {
    const session = await getSession();
    if (!session.id) {
      return { error: { message: "Unauthorized" } };
    }

    // Get user's farm
    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { farms: true },
    });

    if (!user?.farms?.length) {
      return { error: { message: "No farm found" } };
    }

    const farmId = user.farms[0].id;

    // Create product with options
    const product = await db.product.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        photo: result.data.photo,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        final_description: result.data.final_description,
        farmId: farmId,
        options: {
          create: result.data.options.map((option) => ({
            title: option.title,
            price: parseInt(option.price),
            discount: parseInt(option.discount),
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: { message: "Failed to create product" } };
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
