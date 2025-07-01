"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "../ui/card";

interface PreviewCarouselProps {
  preview: string[];
}

export default function PreviewCarousel({ preview }: PreviewCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  // api 설정 및 current 상태 관리
  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="space-y-2">
      <Carousel setApi={setApi} className="w-full aspect-square">
        <CarouselContent>
          {preview.map((srcUrl, index) => (
            <CarouselItem key={index}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-0">
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <Image
                      src={srcUrl}
                      alt={`Preview image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      // onError={(e) => {
                      //   const target = e.target as HTMLImageElement;
                      //   target.src = "/images/default-product.png";
                      // }}
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex justify-center gap-2">
        {preview.map((_, index) => (
          <Button
            key={index}
            type="button"
            variant={current === index ? "default" : "outline"}
            size="sm"
            onClick={() => api?.scrollTo(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
