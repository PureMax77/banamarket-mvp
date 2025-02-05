import ProductDetailClient from "./ProductDetailClient";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      options: true
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
}

export type ProductType = Prisma.PromiseReturnType<
  typeof getProduct
>;

// const getCachedProduct = nextCache(getProduct, ["product-detail"], {
//   tags: ["product-detail", "xxx"],
// });

async function getProductTitle(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
}

// const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
//   tags: ["product-title", "xxx"],
// });

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(Number(params.id));

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  return <ProductDetailClient product={product} />;
}
