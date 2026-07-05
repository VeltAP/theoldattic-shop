import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-shop-bg border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-2xl text-shop-text">
          Vintage Shop
        </Link>

        <nav className="hidden md:flex gap-6 font-body text-shop-text">
          <Link href="/">Home</Link>
          <Link href="/catalog">Catalog</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <Link href="/cart" className="font-body text-shop-accent font-semibold">
          Cart
        </Link>
      </div>
    </header>
  );
}