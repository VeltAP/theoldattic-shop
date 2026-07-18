import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);
const STALE_DAYS = 90;

export async function GET(request: Request) {
  // Verify
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);

  const { data: staleProducts, error } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, price, created_at, categories(name)')
    .eq('is_active', true)
    .lte('created_at', cutoff.toISOString())
    .order('created_at', { ascending: true }); // oldest first

  if (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!staleProducts || staleProducts.length === 0) {
    // Nothing stale — don't send an empty email every week
    return NextResponse.json({ success: true, staleCount: 0 });
  }

  await resend.emails.send({
    from: 'The Old Attic <onboarding@resend.dev>', // swap to real, once have
    to: [process.env.SHOP_CONTACT_EMAIL as string],
    subject: `${staleProducts.length} listing${staleProducts.length === 1 ? '' : 's'} haven't sold in ${STALE_DAYS}+ days`,
    html: renderDigestHtml(staleProducts),
  });

  return NextResponse.json({ success: true, staleCount: staleProducts.length });
}

function renderDigestHtml(
  products: {
    id: number;
    name: string;
    slug: string | null;
    price: number;
    created_at: string | null;
    categories: { name: string } | null;
  }[]
): string {
  const daysListed = (createdAt: string) =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const rows = products
    .map(
      (p) => `
        <tr>
          <td style="padding: 8px 0;">
            <a href="https://theoldattic-shop.vercel.app/product/${p.slug ?? ''}">${p.name}</a>
          </td>
          <td style="padding: 8px 0;">${p.categories?.name ?? '—'}</td>
          <td style="padding: 8px 0; text-align: right;">€${p.price.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right;">${p.created_at ? daysListed(p.created_at) : '?'} days</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Weekly stale-listing digest</h1>
      <p>These ${products.length} items have been listed for 90+ days without selling:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd; text-align: left;">
            <th style="padding: 8px 0;">Item</th>
            <th style="padding: 8px 0;">Category</th>
            <th style="padding: 8px 0; text-align: right;">Price</th>
            <th style="padding: 8px 0; text-align: right;">Listed for</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        Consider repricing, re-photographing, or featuring these on another platform.
      </p>
    </div>
  `;
}