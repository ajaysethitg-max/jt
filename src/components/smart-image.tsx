"use client";

import Image from "next/image";
import { cn } from "@/lib/format";
import { STATIC_BUILD, localHref } from "@/lib/runtime";

const ALLOWED_HOSTS = new Set([
  "images.pexels.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "drive.google.com",
  "cdn.pixabay.com",
  "upload.wikimedia.org",
]);

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}

/**
 * Server mode: local and known-host images go through the Next.js optimiser.
 * Static hosting (GitHub Pages): plain <img> with the base path applied, since
 * there is no image optimiser to run.
 */
export function SmartImage({ src, alt, fill, width, height, sizes, className, priority, onClick }: Props) {
  const isLocal = src.startsWith("/");
  let optimised = !STATIC_BUILD && isLocal;
  if (!optimised && !STATIC_BUILD && !isLocal) {
    try {
      optimised = ALLOWED_HOSTS.has(new URL(src).hostname);
    } catch {
      optimised = false;
    }
  }

  if (optimised) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        className={className}
        priority={priority}
        onClick={onClick}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={isLocal ? localHref(src) : src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      referrerPolicy="no-referrer"
      onClick={onClick}
    />
  );
}
