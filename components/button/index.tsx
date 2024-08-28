"use client";

import { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

interface ButtonProps {
  text: string;
  addClassName?: string;
}

export default function Button({
  text,
  addClassName = "",
  ...rest
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className={`btn disabled:bg-neutral-400 disabled:text-neutral-300 disabled:cursor-not-allowed ${addClassName}`}
      {...rest}
    >
      {pending ? "로딩중..." : text}
    </button>
  );
}
