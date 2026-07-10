'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    title: "Vintage pieces with a story",
    text: "Authentic European furniture and décor, carefully selected and given a second life.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    title: "Timeless European design",
    text: "Discover unique Mid-Century Modern, Art Deco and Italian vintage pieces.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
    title: "Collected across Europe",
    text: "Every piece is personally sourced from antique markets, dealers and private collections.",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] overflow-hidden">

      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current
              ? "opacity-100"
              : "opacity-0"
          }`}
        >

          <img
            src={slide.image}
            alt={slide.title}
            className="object-cover"
            fill
          />


          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />


          {/* Text */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">

            <div className="text-white max-w-3xl">

              <h1 className="font-display text-5xl mb-5">
                {slide.title}
              </h1>

              <p className="text-lg mb-8">
                {slide.text}
              </p>


              <Link
                href="/catalog"
                className="bg-shop-accent text-white px-8 py-3 rounded"
              >
                Explore Collection
              </Link>

            </div>

          </div>

        </div>
      ))}


      {/* Dots */}

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">

        {slides.map((slide, index) => (
          <button
            key={slide.title}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full ${
              current === index
                ? "bg-white"
                : "bg-white/50"
            }`}
          />
        ))}

      </div>


    </section>
  );
}