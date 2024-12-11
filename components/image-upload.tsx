import { PhotoIcon } from "@heroicons/react/24/solid";
import { Input } from "@/components/ui/input";
import PreviewCarousel from "@/components/carousel/preview-carousel";

interface ImageUploadProps {
  preview: string[];
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function ImageUpload({
  preview,
  onImageChange,
  error,
}: ImageUploadProps) {
  return (
    <div>
      {preview.length === 0 ? (
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-lg border-dashed cursor-pointer bg-center bg-cover"
        >
          <PhotoIcon className="w-20" />
          <div className="text-neutral-400 text-sm">
            사진을 추가해주세요.
            {error && <span className="text-red-500">{error}</span>}
          </div>
        </label>
      ) : (
        <PreviewCarousel preview={preview} />
      )}
      <Input
        onChange={onImageChange}
        type="file"
        id="photo"
        name="photo"
        accept="image/*"
        className="hidden"
        multiple
      />
    </div>
  );
}
