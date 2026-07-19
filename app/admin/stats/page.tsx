import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  // 1. All paid orders
  const { data: paidOrders } = await supabaseAdmin
  .from('orders')
  .select('id, total, shipping_country')
  .in('status', ['paid', 'shipped']);

  const orders = paidOrders ?? [];
  const orderIds = orders.map((o) => o.id);

  // 2. Total revenue / order count / average order value
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const aov = orderCount > 0 ? revenue / orderCount : 0;

  // 3. Orders by country
  const byCountry = orders.reduce<Record<string, number>>((acc, o) => {
    const country = o.shipping_country ?? 'Unknown';
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});
  const countryRows = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);

  // 4. Revenue by category — order_items for paid orders, embedding product → category
  const { data: orderItems } = orderIds.length
    ? await supabaseAdmin
        .from('order_items')
        .select('price, quantity, products(category_id, categories(name))')
        .in('order_id', orderIds)
    : { data: [] };

  const revenueByCategory = (orderItems ?? []).reduce<Record<string, number>>((acc, item) => {
  const categoryName = item.products?.categories?.name ?? 'Uncategorized';
  acc[categoryName] = (acc[categoryName] ?? 0) + (item.price ?? 0) * (item.quantity ?? 0);
  return acc;
}, {});
  const categoryRevenueRows = Object.entries(revenueByCategory).sort((a, b) => b[1] - a[1]);

  // 5. Time-to-sell by category
  const { data: soldProducts } = await supabaseAdmin
    .from('products')
    .select('created_at, sold_at, categories(name)')
    .not('sold_at', 'is', null);

  const daysToSellByCategory = (soldProducts ?? []).reduce<Record<string, number[]>>((acc, p) => {
    if (!p.sold_at || !p.created_at) return acc;
    const categoryName = p.categories?.name ?? 'Uncategorized';
    const days =
      (new Date(p.sold_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
    acc[categoryName] = acc[categoryName] ? [...acc[categoryName], days] : [days];
    return acc;
  }, {});
  const avgDaysToSellRows = Object.entries(daysToSellByCategory).map(([name, daysArr]) => [
    name,
    daysArr.reduce((sum, d) => sum + d, 0) / daysArr.length,
  ]) as [string, number][];

  const maxCategoryRevenue = Math.max(...categoryRevenueRows.map(([, v]) => v), 1);
  const maxCountryCount = Math.max(...countryRows.map(([, v]) => v), 1);
  const maxDaysToSell = Math.max(...avgDaysToSellRows.map(([, v]) => v), 1);

  return (
    <div className="max-w-5xl mx-auto mt-12 pb-20">
      <h1 className="font-display text-2xl text-shop-text mb-8">Stats</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="border rounded p-4">
          <p className="text-sm text-shop-text/60">Total revenue</p>
          <p className="text-2xl font-semibold">€{revenue.toFixed(2)}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-shop-text/60">Orders</p>
          <p className="text-2xl font-semibold">{orderCount}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-shop-text/60">Average order value</p>
          <p className="text-2xl font-semibold">€{aov.toFixed(2)}</p>
        </div>
      </div>

      {/* Revenue by category */}
      <h2 className="font-display text-xl mb-3">Revenue by category</h2>
      <div className="space-y-2 mb-10">
        {categoryRevenueRows.map(([name, value]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="w-40 text-sm">{name}</span>
            <div className="flex-1 bg-gray-100 rounded h-5">
              <div
                className="bg-shop-accent h-5 rounded"
                style={{ width: `${(value / maxCategoryRevenue) * 100}%` }}
              />
            </div>
            <span className="w-24 text-sm text-right">€{value.toFixed(2)}</span>
          </div>
        ))}
        {categoryRevenueRows.length === 0 && <p className="text-sm text-shop-text/50">No data yet.</p>}
      </div>

      {/* Orders by country */}
      <h2 className="font-display text-xl mb-3">Orders by country</h2>
      <div className="space-y-2 mb-10">
        {countryRows.map(([country, count]) => (
          <div key={country} className="flex items-center gap-3">
            <span className="w-40 text-sm">{country}</span>
            <div className="flex-1 bg-gray-100 rounded h-5">
              <div
                className="bg-shop-accent h-5 rounded"
                style={{ width: `${(count / maxCountryCount) * 100}%` }}
              />
            </div>
            <span className="w-24 text-sm text-right">{count}</span>
          </div>
        ))}
        {countryRows.length === 0 && <p className="text-sm text-shop-text/50">No data yet.</p>}
      </div>

      {/* Time to sell by category */}
      <h2 className="font-display text-xl mb-3">Average days to sell by category</h2>
      <div className="space-y-2">
        {avgDaysToSellRows.map(([name, days]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="w-40 text-sm">{name}</span>
            <div className="flex-1 bg-gray-100 rounded h-5">
              <div
                className="bg-shop-accent h-5 rounded"
                style={{ width: `${(days / maxDaysToSell) * 100}%` }}
              />
            </div>
            <span className="w-24 text-sm text-right">{days.toFixed(1)} days</span>
          </div>
        ))}
        {avgDaysToSellRows.length === 0 && <p className="text-sm text-shop-text/50">No data yet.</p>}
      </div>
    </div>
  );
}