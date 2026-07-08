import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('shipping_rates')
    .select('id, rate, category_id, categories(name), zone_id, shipping_zones(name)')
    .order('category_id')
    .order('zone_id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ rates: data });
}

type UpdateBody = { id: number; rate: number };

export async function PATCH(request: Request) {
  const { id, rate }: UpdateBody = await request.json();

  const { error } = await supabaseAdmin
    .from('shipping_rates')
    .update({ rate })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}