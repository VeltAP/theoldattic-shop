'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type GalleryImage = { url: string; sort_order: number | null };

export default function ProductGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  function showPhoto(index: number) {
    setSelected(index);
    thumbRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  function goTo(direction: 'left' | 'right') {
    const next =
      direction === 'left'
        ? (selected - 1 + images.length) % images.length
        : (selected + 1) % images.length;
    showPhoto(next);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;
    if (deltaX > SWIPE_THRESHOLD) goTo('left');
    else if (deltaX < -SWIPE_THRESHOLD) goTo('right');
    touchStartX.current = null;
  }

  if (images.length === 0) {
    return <div className="w-full aspect-square bg-gray-200 rounded-lg" />;
  }

  return (
    <div className="w-full min-w-0">
      {/* Main photo */}
      <div
        className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={images[selected].url}
          src={images[selected].url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={selected === 0}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo('left')}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 md:h-9 md:w-9 rounded-full bg-white/90 text-shop-text active:bg-white hover:bg-white hover:text-shop-accent transition-colors shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo('right')}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 md:h-9 md:w-9 rounded-full bg-white/90 text-shop-text active:bg-white hover:bg-white hover:text-shop-accent transition-colors shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    selected === i ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory w-full min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => showPhoto(i)}
              aria-label={`View photo ${i + 1} of ${images.length}`}
              aria-current={selected === i}
              className={`relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded overflow-hidden border-2 snap-start transition-colors ${
                selected === i ? 'border-shop-accent' : 'border-transparent'
              }`}
            >
              <Image
                src={img.url}
                alt={`${alt} — photo ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}