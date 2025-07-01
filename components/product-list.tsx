"use client";

import { useEffect, useRef, useState } from "react";
import { InitialProducts } from "@/app/(tabs)/page";
import { getMoreProducts } from "@/app/(tabs)/actions";
import ListProduct from "./list-product";

interface ProductListProps {
  initialProducts: InitialProducts;
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const trigger = useRef<HTMLSpanElement>(null);

  // 무한스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        // trigger가 화면에서 사라지거나 나타날때 실행
        const element = entries[0];
        if (element.isIntersecting && trigger.current) {
          observer.unobserve(trigger.current);
          setIsLoading(true);

          const newProducts = await getMoreProducts(page + 1);

          if (newProducts.length !== 0) {
            setPage((prev) => prev + 1);
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            // 더 불러온 목록이 없으면
            setIsLastPage(true);
          }
          setIsLoading(false);
        }
      },
      {
        // 해당요소가 화면에 얼마나 보이면 작동할지
        // default: 0 보이는 즉시
        threshold: 0.1,
        // tab bar 때문에 못보는데 마진으로 지점을 offset 가능
        // rootMargin: "0px 0px -100px 0px",
      }
    );
    if (trigger.current) {
      observer.observe(trigger.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [page]);

  return (
    <div className="flex flex-col">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
      {!isLastPage && (
        <span
          ref={trigger}
          className="mt-14 text-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95 transition-transform"
        >
          {isLoading ? "Loading..." : "Load More"}
        </span>
      )}
      {isLastPage && <div className="w-full py-10 h-16"></div>}
    </div>
  );
}
