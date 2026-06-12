import Image from "next/image";

import { cn } from "@/lib/utils";

type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
};

export function SiteImage({
  src,
  alt,
  className,
  imageClassName,
  objectPosition,
  priority = false,
  sizes = "100vw"
}: SiteImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-panel", className)}>
      <Image
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        fill
        priority={priority}
        sizes={sizes}
        src={src}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
