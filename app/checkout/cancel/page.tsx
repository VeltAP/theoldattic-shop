import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">

      <h1 className="text-4xl font-display mb-6">
        Checkout Cancelled
      </h1>

      <p className="text-gray-600 leading-7 mb-10">
        Your checkout has been cancelled. Don&apos;t worry, your shopping cart has
        been saved, so you can continue shopping or complete your purchase
        whenever you&apos;re ready.
      </p>

      <div className="flex justify-center gap-4">

        <Link
          href="/cart"
          className="bg-shop-accent text-white px-6 py-3 rounded hover:opacity-90"
        >
          Return to Cart
        </Link>

        <Link
          href="/catalog"
          className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-100"
        >
          Continue Shopping
        </Link>

      </div>

    </div>
  );
}