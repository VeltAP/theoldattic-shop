import Link from 'next/link';
// import { Instagram, Facebook } from 'lucide-react';

const CATEGORY_LINKS = [
  { href: '/catalog/lighting', label: 'Light & Lamps' },
  { href: '/catalog/seating', label: 'Seating' },
  { href: '/catalog/cabinets-storage', label: 'Cabinets & Storage' },
  { href: '/catalog/tables-trolleys', label: 'Table & Trolleys' },
  { href: '/catalog/mirrors', label: 'Mirrors' },
  { href: '/catalog/decorative', label: 'Decorative' },
];

const SHOP_LINKS = [
  { href: '/catalog', label: 'Catalog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

const POLICY_LINKS = [
  { href: '/policy/terms-of-service', label: 'Terms of Service' },
  { href: '/policy/privacy-policy', label: 'Privacy Policy' },
  { href: '/policy/shipping-policy', label: 'Shipping Policy' },
  { href: '/policy/returns-policy', label: 'Returns & Refunds' },
];

// const SOCIAL_LINKS = [
//   { href: 'https://instagram.com/yourshop', label: 'Instagram', Icon: Instagram },
//   { href: 'https://facebook.com/yourshop', label: 'Facebook', Icon: Facebook },
// ];

export default function Footer() {
  return (
    <footer className="bg-shop-bg border-t border-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 font-body text-sm text-shop-text">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo + company info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl text-shop-text">
              The Old Attic
            </Link>
            <div className="mt-3 space-y-1 text-shop-text/80">
              <p>SIDK d.o.o.</p>
              <p>Miklavz pri Taboru 61a, 3304 Tabor, Slovenia</p>
              <p>VAT ID: SI 34875590</p>
              <p>
                <a href="mailto:oldattic.si@gmail.com" className="hover:text-shop-accent transition-colors">
                  oldattic.si@gmail.com
                </a>
              </p>
            </div>

            {/* Social icons */}
            {/* <div className="flex gap-4 mt-4">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-shop-text hover:text-shop-accent transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div> */}
          </div>

          {/* Sitemap: shop categories */}
          <div>
            <h3 className="font-semibold text-shop-text mb-3">Shop</h3>
            <ul className="space-y-2">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-shop-text/80 hover:text-shop-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sitemap: shop info pages */}
          <div>
            <h3 className="font-semibold text-shop-text mb-3">Shop Info</h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-shop-text/80 hover:text-shop-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy pages */}
          <div>
            <h3 className="font-semibold text-shop-text mb-3">Policies</h3>
            <ul className="space-y-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-shop-text/80 hover:text-shop-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-6 text-center text-shop-text/70">
          <p>&copy; {new Date().getFullYear()} The Old Attic. All items sold as-is, condition described per listing.</p>
        </div>
      </div>
    </footer>
  );
}