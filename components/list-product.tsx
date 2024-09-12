import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import BigNumber from "bignumber.js";

interface ListProductProps {
  title: string;
  price: number;
  discount: number | null;
  startDate: Date;
  endDate: Date | null;
  created_at: Date;
  photo: string[];
  id: number;
}

export default function ListProduct({
  title,
  price,
  discount,
  startDate,
  endDate,
  created_at,
  photo,
  id,
}: ListProductProps) {
  const finalPrice = discount
    ? BigNumber(price).multipliedBy(discount).dividedBy(100).toNumber()
    : price;

  return (
    <Link
      href={`/products/${id}`}
      className="flex gap-5 p-5 border-neutral-200 border-b"
    >
      <div className="relative size-28 min-w-28 rounded-md overflow-hidden">
        <Image
          fill
          src={`${photo[0]}/avatar`}
          alt={title}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-1">
        <span className="text-lg">{title}</span>
        <div>
          {discount && (
            <span className="text-sm text-neutral-400 line-through">
              {formatToWon(price)}
            </span>
          )}
          <div className="flex items-end gap-1">
            {discount && (
              <span className="text-lg text-yellow-500">{discount}%</span>
            )}
            <span className="text-lg font-semibold">
              {formatToWon(finalPrice)}원
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
