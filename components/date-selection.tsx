import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectionProps {
  startDate: Date;
  endDate: Date;
  isEndless: boolean;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setIsEndless: (isEndless: boolean) => void;
}

export default function DateSelection({
  startDate,
  endDate,
  isEndless,
  setStartDate,
  setEndDate,
  setIsEndless,
}: DateSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>판매 기간 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="font-medium">시작</div>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className="p-2 border rounded hover:cursor-pointer w-full"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="font-medium">종료</div>
              {!isEndless && (
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="p-2 border rounded hover:cursor-pointer w-full"
                />
              )}
            </div>
            <Button type="button" onClick={() => setIsEndless(!isEndless)} className="self-end mb-1">
              {isEndless ? "종료 시점 설정" : "상시 판매"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
