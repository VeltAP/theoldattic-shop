import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  const { name, price, category_id, stock_quantity, description, slug } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name,
      price,
      category_id,
      stock_quantity,
      description,
      slug,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, product: data });
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json();

  const { error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}