import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
// import HeroCarousel from "../components/HeroCarousel";
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
    <div>

      {/* Hero */}
      <section className="relative h-[600px] bg-gray-200 flex items-center justify-center">

        <div className="text-center px-4">

          <h1 className="font-display text-5xl mb-5">
            Vintage pieces with a story
          </h1>

          <p className="text-lg max-w-xl mx-auto text-gray-700 mb-8">
            Authentic European vintage furniture and décor,
            carefully selected and given a second life.
          </p>

          <Link
            href="/catalog"
            className="bg-shop-accent text-white px-8 py-3 rounded"
          >
            Explore Collection
          </Link>

        </div>

      </section>
      


      {/* Brands */}
      <section className="py-10 border-b">

        <p className="text-center text-gray-500 mb-6">
          Proudly featured on
        </p>


        <div className="flex flex-wrap justify-center gap-8">

          {brands.map((brand) => (
            <span
              key={brand}
              className="text-xl font-medium text-gray-700"
            >
              {brand}
            </span>
          ))}

        </div>

      </section>


      {/* New products */}

      <section className="max-w-6xl mx-auto px-4 py-16">

        <div className="flex justify-between items-center mb-8">

          <h2 className="font-display text-3xl">
            What&apos;s New
          </h2>


          <Link
            href="/catalog"
            className="text-shop-accent"
          >
            View all
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

      <section className="bg-gray-100 py-16">

        <div className="max-w-4xl mx-auto text-center px-4">

          <h2 className="font-display text-3xl mb-5">
            Sourced across Europe
          </h2>

          <p className="text-gray-700 leading-8">
            Since 2016 we have been searching for unique vintage pieces
            throughout Europe. Every item is selected individually,
            because we believe the best objects are not manufactured —
            they are discovered.
          </p>


          <Link
            href="/about"
            className="inline-block mt-8 border border-gray-300 px-6 py-3 rounded"
          >
            Our Story
          </Link>

        </div>

      </section>


    </div>
  );
}