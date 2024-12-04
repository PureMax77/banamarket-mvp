"use client";

import { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export default function CustomButton({
  text,
  className,
  ...rest
}: CustomButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      className={cn(
        "disabled:bg-neutral-400 disabled:text-neutral-300 disabled:opacity-100",
        className
      )}
      {...rest}
    >
      {pending ? "로딩중..." : text}
    </Button>
  );
}
