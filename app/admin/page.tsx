import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <h1 className="font-display text-3xl text-shop-text mb-6">Admin Dashboard</h1>
      <div className="flex flex-col gap-3">
        <Link href="/admin/products" className="text-shop-accent underline">
          Manage Products
        </Link>
        <Link href="/admin/orders" className="text-shop-accent underline">
          View Orders
        </Link>
        <Link href="/admin/shipping" className="text-shop-accent underline">
          Manage Shipping Rates
        </Link>
        <Link href="/admin/stats" className="text-shop-accent underline">
          View Stats
        </Link>
        <Link href="/admin/blog" className="text-shop-accent underline">
          Manage Blog Posts
        </Link>
        <Link href="/admin/sales" className="text-shop-accent underline">
          Manage Sales & Discounts
        </Link>
      </div>
    </div>
  );
}