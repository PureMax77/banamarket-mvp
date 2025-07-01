"use server";

import { FEED_CONTENT_COUNT } from "@/lib/constants";
import db from "@/lib/db";

export async function getMoreProducts(page: number) {
  const products = await db.product.findMany({
    select: {
      title: true,
      startDate: true,
      endDate: true,
      created_at: true,
      photo: true,
      id: true,
      options: {
        select: {
          title: true,
          price: true,
          discount: true,
        },
      },
    },
    skip: page * FEED_CONTENT_COUNT,
    take: FEED_CONTENT_COUNT,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}
