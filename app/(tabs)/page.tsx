import ProductList from "@/components/product-list";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

async function getInitialProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      discount: true,
      startDate: true,
      endDate: true,
      created_at: true,
      photo: true,
      id: true,
    },
    take: 3,
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

  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };

  return (
    <div>
      {/* <form action={logOut}>
        <button className="btn">logout</button>
      </form> */}
      <ProductList initialProducts={initialProducts} />
    </div>
  );
}
