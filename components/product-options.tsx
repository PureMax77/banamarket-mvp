import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@heroicons/react/24/outline";

interface IOption {
  title: string;
  price: string;
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
            <Input
              type="text"
              placeholder="상품명"
              value={option.title}
              onChange={(e) =>
                handleOptionChange(index, "title", e.target.value)
              }
              required
            />
            <Input
              type="text"
              placeholder="가격"
              value={option.price}
              onChange={(e) =>
                handleOptionChange(index, "price", e.target.value)
              }
              required
            />
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
