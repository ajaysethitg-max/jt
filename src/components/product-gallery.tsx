"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Zap } from "lucide-react";
import { cn } from "@/lib/format";
import { SmartImage } from "./smart-image";

export function ProductGallery({ images, name, hasDeal }: { images: string[]; name: string; hasDeal: boolean }) {
  const list = images.length ? images : ["/images/hero.jpg"];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const imageKey = list.join("|");
  useEffect(() => {
    setIndex(0);
    setZoom(false);
  }, [imageKey]);

  const go = (delta: number) => {
    setZoom(false);
    setIndex((i) => (i + delta + list.length) % list.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-ink-50 ring-1 ring-ink-100">
        <SmartImage
          key={index}
          src={list[index] ?? list[0]}
          alt={`${name} — photo ${index + 1} of ${list.length}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn("object-cover transition-transform duration-500 ease-out", zoom ? "scale-[1.9] cursor-zoom-out" : "cursor-zoom-in")}
          priority={index === 0}
          onClick={() => setZoom((z) => !z)}
        />
        {hasDeal && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-bp-500 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-pink">
            <Zap className="h-3.5 w-3.5" fill="currentColor" /> Deal price
          </span>
        )}
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-soft transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-soft transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setZoom((z) => !z)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-ink-900"
        >
          <ZoomIn className="h-3.5 w-3.5" /> {zoom ? "Zoom out" : "Zoom"}
        </button>
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setZoom(false);
                setIndex(i);
              }}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                i === index ? "ring-tq-500" : "ring-transparent opacity-70 hover:opacity-100 hover:ring-tq-200",
              )}
              aria-label={`View photo ${i + 1}`}
            >
              <SmartImage src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
