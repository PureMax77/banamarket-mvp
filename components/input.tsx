import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";

interface InputProps {
  name: string;
  errors?: string[];
}

const _Input = (
  {
    name, // name도 rest에 속하지만 필수인걸 알려주기 위해 씀
    errors = [],
    ...rest
  }: InputProps & InputHTMLAttributes<HTMLInputElement>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={ref}
        name={name}
        className="input input-bordered w-full"
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
