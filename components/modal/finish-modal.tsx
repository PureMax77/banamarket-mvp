import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface FinishModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
}

export default function FinishModal({ open, onOpenChange, onConfirm }: FinishModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="px-2">
                    판매완료 처리
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>판매완료 처리</DialogTitle>
                    <DialogDescription>
                        판매 완료로 처리하면 즉시 다시 판매 중으로 되돌릴 수 없습니다.
                        <br />
                        계속 진행하시겠습니까?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={onConfirm}>
                        완료처리
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 