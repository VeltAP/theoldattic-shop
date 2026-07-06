import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div>
      <h1>Checkout cancelled</h1>
      <p>Your cart is still saved — you can try again whenever you&apos;re ready.</p>
      <Link href="/cart">Return to cart</Link>
    </div>
  );
}