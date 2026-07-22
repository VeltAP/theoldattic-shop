import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import Link from "next/link";

const brands = [
  "Etsy",
  "Pamono",
  "Chairish",
  "1stDibs",
  "Selency",
  "Vinterior",
  "VNTG",
];

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, product_images(url, sort_order)")
    .eq("is_active", true)
    .limit(8);

  if (error) {
    console.error(error);
  }

  return (
    <div className="bg-shop-bg text-shop-text">

      <section className="relative min-h-[560px] flex items-center justify-center border-b border-shop-text/20 overflow-hidden">

        <div
          className="absolute inset-0 bg-gradient-to-b from-shop-accent/[0.06] to-transparent"
          aria-hidden="true"
        />

        <div className="relative text-center px-4 max-w-2xl mx-auto">

          <p className="text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-5">
            Ljubljana, Slovenia · Since 2016
          </p>

          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
            Vintage pieces
            <br />
            with a story
          </h1>

          <p className="text-base md:text-lg leading-8 text-shop-text/70 font-body max-w-lg mx-auto mb-9">
            Authentic European vintage furniture and décor, carefully
            selected and given a second life.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="bg-shop-accent text-shop-bg font-body text-sm tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Explore Collection
            </Link>
            <Link
              href="/about"
              className="border border-shop-text/20 font-body text-sm tracking-wide px-8 py-3 rounded hover:border-shop-accent hover:text-shop-accent transition-colors"
            >
              Our Story
            </Link>
          </div>

        </div>

        <div className="hidden md:flex absolute bottom-8 right-10 w-24 h-24 rounded-full border border-shop-accent/40 items-center justify-center rotate-[-6deg]">
          <div className="absolute inset-2 rounded-full border border-shop-accent/40" />
          <p className="text-center font-display text-shop-accent text-xs leading-tight px-3">
            Hand&#8209;picked
            <br />
            <span className="text-[10px] tracking-[0.15em] uppercase font-body">since 2016</span>
          </p>
        </div>

      </section>

      <section className="py-14 border-b border-shop-text/20">

        <p className="text-center text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-6">
          Proudly Featured On
        </p>

        <div className="flex flex-wrap justify-center gap-3 px-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-sm font-body border border-shop-text/20 rounded px-4 py-2 text-shop-text/80"
            >
              {brand}
            </span>
          ))}
        </div>

      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">

        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-2">
              Fresh Finds
            </p>
            <h2 className="font-display text-3xl">What&apos;s New</h2>
          </div>

          <Link
            href="/catalog"
            className="text-sm font-body text-shop-text/70 hover:text-shop-accent transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageUrl={product.product_images?.[0]?.url}
            />
          ))}
        </div>

      </section>

      {/* Story */}
      <section className="border-t border-shop-text/20 py-20">

        <div className="max-w-2xl mx-auto text-center px-6">

          <p className="text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-4">
            Our Approach
          </p>

          <h2 className="font-display text-3xl mb-6">
            Sourced across Europe
          </h2>

          <p className="text-shop-text/70 font-body leading-8">
            Since 2016 we have been searching for unique vintage pieces
            throughout Europe. Every item is selected individually, because
            we believe the best objects are not manufactured &mdash; they
            are discovered.
          </p>

          <Link
            href="/about"
            className="inline-block mt-9 border border-shop-text/20 font-body text-sm tracking-wide px-7 py-3 rounded hover:border-shop-accent hover:text-shop-accent transition-colors"
          >
            Read Our Story
          </Link>

        </div>

      </section>

    </div>
  );
}