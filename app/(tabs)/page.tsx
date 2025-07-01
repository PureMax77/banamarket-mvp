import ProductList from "@/components/product-list";
import { FEED_CONTENT_COUNT } from "@/lib/constants";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";

async function getInitialProducts() {
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
    take: FEED_CONTENT_COUNT,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

export default async function Home() {
  const initialProducts = await getInitialProducts();

  return (
    <div className="px-4">
      <ProductList initialProducts={initialProducts} />
    </div>
  );
}
