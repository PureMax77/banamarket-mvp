import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@heroicons/react/24/outline";

interface IOption {
  title: string;
  price: string;
  discount: string;
}

interface ProductOptionsProps {
  options: IOption[];
  handleOptionChange: (index: number, field: keyof IOption, value: any) => void;
  removeOption: (index: number) => void;
  addOption: () => void;
}

export default function ProductOptions({
  options,
  handleOptionChange,
  removeOption,
  addOption,
}: ProductOptionsProps) {
  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              옵션 {index + 1}
            </CardTitle>
            <Button
              type="button"
              onClick={() => removeOption(index)}
              variant="destructive"
              size="sm"
            >
              삭제
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor={`title-${index}`}
                className="text-sm font-medium min-w-[48px]"
              >
                상품명
              </label>
              <Input
                id={`title-${index}`}
                type="text"
                value={option.title}
                onChange={(e) =>
                  handleOptionChange(index, "title", e.target.value)
                }
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label
                htmlFor={`price-${index}`}
                className="text-sm font-medium min-w-[70px]"
              >
                가격(원)
              </label>
              <Input
                id={`price-${index}`}
                type="text"
                value={option.price}
                onChange={(e) =>
                  handleOptionChange(index, "price", e.target.value)
                }
                required
              />
            </div>
            {/* <div className="flex items-center gap-4">
              <label
                htmlFor={`discount-${index}`}
                className="text-sm font-medium min-w-[70px]"
              >
                할인율(%)
              </label>
              <Input
                id={`discount-${index}`}
                type="number"
                min="0"
                max="99"
                value={option.discount}
                onChange={(e) => {
                  const value = Math.min(
                    Math.max(0, parseInt(e.target.value) || 0),
                    99
                  );
                  handleOptionChange(index, "discount", value.toString());
                }}
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium min-w-[70px]">최종가격</span>
              <span className="text-sm text-red-500">
                {new Intl.NumberFormat("ko-KR").format(
                  Math.round(
                    parseInt(option.price.replace(/,/g, "")) *
                      (1 - parseInt(option.discount) / 100)
                  )
                )}
                원
              </span>
            </div> */}
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        onClick={addOption}
        variant="outline"
        className="w-full"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        옵션 추가
      </Button>
    </div>
  );
}
