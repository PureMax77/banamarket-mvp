import db from "@/lib/db";
import { ProductOption, SimplifiedOption } from "@/app/types/product";
import { Prisma } from "@prisma/client";
import OrderClient from "./order-client";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    options?: string;
  };
}

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      include: {
        addresses: {
          orderBy: {
            isDefault: 'desc',
          },
        },
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

async function getProduct(id: number) {
    const product = await db.product.findUnique({
      where: {
        id,
      },
      include: {
        options: true,
        farm: {
          include: {
            user: true
          }
        }
      },
    });
    if (!product) throw new Error("Product not found");
    return product;
}

export type OrderProductType = Prisma.PromiseReturnType<
  typeof getProduct
>;

// OrderProductType에서 options의 타입 추출
type OptionType = NonNullable<OrderProductType>["options"];
type OptionElement = OptionType[number];
type OptionWithQuantity = OptionElement & { quantity: number };
export type OrderOptionType = OptionWithQuantity[];


export default async function OrderPage({ params, searchParams }: PageProps) {
  const product = await getProduct(Number(params.id));
  const user = await getUser();
  
  if (!product) {
    throw new Error("Product not found");
  }

  let selectedOptions: SimplifiedOption[] = [];
  if (searchParams.options) {
    try {
      selectedOptions = JSON.parse(decodeURIComponent(searchParams.options));
    } catch (error) {
      console.error("Failed to parse options:", error);
    }
  }

  // 선택된 옵션 ID들에 대한 전체 정보 매핑
  const optionsWithDetails = selectedOptions.map((option) => {
    const productOption = product.options.find((po: ProductOption) => po.id === option.id);
    if (!productOption) {
      throw new Error(`Option ${option.id} not found`);
    }
    return {
      ...productOption,
      quantity: option.quantity,
    };
  });

  return (
    <OrderClient
      product={product}
      selectedOptions={optionsWithDetails}
      user={user}
    />
  );
}

