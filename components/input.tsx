import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface InputProps {
  name: string;
  errors?: string[];
}

const _Input = (
  {
    name, // name도 rest에 속하지만 필수인걸 알려주기 위해 씀
    className,
    errors = [],
    ...rest
  }: InputProps & InputHTMLAttributes<HTMLInputElement>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Input
        ref={ref}
        name={name}
        className={cn("w-full bg-white", className)}
        {...rest}
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </div>
  );
};

export default forwardRef(_Input);
