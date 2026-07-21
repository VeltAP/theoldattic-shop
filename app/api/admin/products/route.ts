import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../../lib/requireAdmin';

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, price, category_id, stock_quantity, description, slug, tagIds } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ name, price, category_id, stock_quantity, description, slug, is_active: true })
    .select()
    .single();

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });

  if (Array.isArray(tagIds) && tagIds.length > 0) {
    const { error: tagError } = await supabaseAdmin
      .from('product_tags')
      .insert(tagIds.map((tagId: number) => ({ product_id: data.id, tag_id: tagId })));

    if (tagError) {
      return Response.json({ success: false, error: tagError.message }, { status: 500 });
    }
  }

  return Response.json({ success: true, product: data });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, updates, tagIds } = await request.json();

  const { error } = await supabaseAdmin.from('products').update(updates).eq('id', id);

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });

  if (Array.isArray(tagIds)) {
    await supabaseAdmin.from('product_tags').delete().eq('product_id', id);

    if (tagIds.length > 0) {
      const { error: tagError } = await supabaseAdmin
        .from('product_tags')
        .insert(tagIds.map((tagId: number) => ({ product_id: id, tag_id: tagId })));

      if (tagError) {
        return Response.json({ success: false, error: tagError.message }, { status: 500 });
      }
    }
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

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

  await supabaseAdmin.from('product_images').delete().eq('product_id', id);
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true });
}