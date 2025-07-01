import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderWithTitleProps {
    title: string;
}

export default function HeaderWithTitle({ title }: HeaderWithTitleProps) {
    const router = useRouter();

    return (
        <div className="flex items-center px-4 py-3 border-b">
            <button onClick={() => router.back()} className="mr-2">
                <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-medium">{title}</h1>
        </div>
    );
} 