import Image from "next/image";

import { cn } from "@/lib/utils";

type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function SiteImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "100vw"
}: SiteImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-panel/40", className)}>
      <Image
        alt={alt}
        className="h-full w-full object-cover"
        fill
        priority={priority}
        sizes={sizes}
        src={src}
      />
    </div>
  );
}
