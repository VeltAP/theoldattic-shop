'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';
import { Menu, X, ShoppingBag, Heart } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
  { href: '/order-status', label: 'Order Status' },
];

export default function Header() {
  const { items } = useCart();
  const { favoriteIds } = useFavorites();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-shop-bg border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-4xl text-shop-text">
          The Old Attic
        </Link>

        <nav className="hidden md:flex gap-6 font-body text-shop-text">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-shop-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/favorites"
            className="relative flex items-center text-shop-text hover:text-shop-accent transition-colors"
            aria-label={`Favorites, ${favoriteIds.length} item${favoriteIds.length === 1 ? '' : 's'}`}
          >
            <Heart className="h-6 w-6" />
            {favoriteIds.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-shop-accent text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                {favoriteIds.length}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center text-shop-text hover:text-shop-accent transition-colors"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-shop-accent text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-shop-text"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-4 pb-4 font-body text-shop-text border-t border-gray-300 pt-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 hover:text-shop-accent transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}