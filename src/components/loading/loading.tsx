import { LoadingFour } from "@icon-park/react";

export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center text-center">
      <LoadingFour
        theme="outline"
        size="24"
        className="keyframes-spin-1s w-24px h-24px"
      />
    </div>
  );
}
