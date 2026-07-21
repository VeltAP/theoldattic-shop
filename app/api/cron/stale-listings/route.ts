import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);
const STALE_DAYS = 60; // for stale listings
const REPORT_WINDOW_DAYS = 7; //for sold items

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - STALE_DAYS);

  const soldSinceCutoff = new Date();
  soldSinceCutoff.setDate(soldSinceCutoff.getDate() - REPORT_WINDOW_DAYS);

  const { data: staleProducts, error: staleError } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, price, created_at, categories(name)')
    .eq('is_active', true)
    .lte('created_at', staleCutoff.toISOString())
    .order('created_at', { ascending: true });

  if (staleError) {
    console.error(staleError);
    return NextResponse.json({ success: false, error: staleError.message }, { status: 500 });
  }

  const { data: soldProducts, error: soldError } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, price, sold_at, categories(name)')
    .eq('is_active', false)
    .gte('sold_at', soldSinceCutoff.toISOString())
    .order('sold_at', { ascending: false });

  if (soldError) {
    console.error(soldError);
    return NextResponse.json({ success: false, error: soldError.message }, { status: 500 });
  }

  const staleCount = staleProducts?.length ?? 0;
  const soldCount = soldProducts?.length ?? 0;

  if (staleCount === 0 && soldCount === 0) {
    // Nothing to report this week — skip sending an empty email
    return NextResponse.json({ success: true, staleCount: 0, soldCount: 0 });
  }

  await resend.emails.send({
    from: 'The Old Attic <onboarding@resend.dev>', // swap once domain verified
    to: [process.env.SHOP_CONTACT_EMAIL as string],
    subject: `Weekly report — ${soldCount} sold, ${staleCount} stale listing${staleCount === 1 ? '' : 's'}`,
    html: renderDigestHtml(staleProducts ?? [], soldProducts ?? []),
  });

  return NextResponse.json({ success: true, staleCount, soldCount });
}

type StaleProduct = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  created_at: string | null;
  categories: { name: string } | null;
};

type SoldProduct = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  sold_at: string | null;
  categories: { name: string } | null;
};

function renderDigestHtml(staleProducts: StaleProduct[], soldProducts: SoldProduct[]): string {
  const daysListed = (createdAt: string) =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const staleRows = staleProducts
    .map(
      (p) => `
        <tr>
          <td style="padding: 8px 0;">
            <a href="https://theoldattic-shop.com/product/${p.slug ?? ''}">${p.name}</a>
          </td>
          <td style="padding: 8px 0;">${p.categories?.name ?? '—'}</td>
          <td style="padding: 8px 0; text-align: right;">€${p.price.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right;">${p.created_at ? daysListed(p.created_at) : '?'} days</td>
        </tr>`
    )
    .join('');

  const soldRows = soldProducts
    .map(
      (p) => `
        <tr>
          <td style="padding: 8px 0;">${p.name}</td>
          <td style="padding: 8px 0;">${p.categories?.name ?? '—'}</td>
          <td style="padding: 8px 0; text-align: right;">€${p.price.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right;">${
            p.sold_at ? new Date(p.sold_at).toLocaleDateString() : '—'
          }</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Weekly report</h1>

      <h2 style="font-size: 16px; margin-top: 24px;">Sold this week (${soldProducts.length})</h2>
      ${
        soldProducts.length > 0
          ? `<table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                  <th style="padding: 8px 0;">Item</th>
                  <th style="padding: 8px 0;">Category</th>
                  <th style="padding: 8px 0; text-align: right;">Price</th>
                  <th style="padding: 8px 0; text-align: right;">Sold on</th>
                </tr>
              </thead>
              <tbody>${soldRows}</tbody>
            </table>`
          : `<p style="color: #666;">Nothing sold this week.</p>`
      }

      <h2 style="font-size: 16px; margin-top: 30px;">Stale listings — 60+ days (${staleProducts.length})</h2>
      ${
        staleProducts.length > 0
          ? `<table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                  <th style="padding: 8px 0;">Item</th>
                  <th style="padding: 8px 0;">Category</th>
                  <th style="padding: 8px 0; text-align: right;">Price</th>
                  <th style="padding: 8px 0; text-align: right;">Listed for</th>
                </tr>
              </thead>
              <tbody>${staleRows}</tbody>
            </table>`
          : `<p style="color: #666;">No stale listings.</p>`
      }

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        Consider repricing, re-photographing, or featuring stale items on another platform.
      </p>
    </div>
  `;
}

// Invoke-WebRequest -Uri "http://localhost:3000/api/cron/stale-listings" -Headers @{ Authorization = "Bearer CRON_SECRET"}