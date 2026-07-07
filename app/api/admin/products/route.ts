import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  const { name, price, category_id, stock_quantity, description, slug } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ name, price, category_id, stock_quantity, description, slug, is_active: true })
    .select()
    .single();

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true, product: data });
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json();

  const { error } = await supabaseAdmin.from('products').update(updates).eq('id', id);

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  // Find every image row for this product first, so we can also remove the actual files
  const { data: images } = await supabaseAdmin
    .from('product_images')
    .select('url')
    .eq('product_id', id);

  if (images && images.length > 0) {
    const paths = images.map((img) => {
      const marker = '/product-images/';
      const index = img.url.indexOf(marker);
      return img.url.slice(index + marker.length);
    });
    await supabaseAdmin.storage.from('product-images').remove(paths);
  }

  // Deleting the product row also removes its product_images rows automatically
  // if your foreign key was set up with ON DELETE CASCADE; otherwise delete them explicitly first
  await supabaseAdmin.from('product_images').delete().eq('product_id', id);
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true });
}