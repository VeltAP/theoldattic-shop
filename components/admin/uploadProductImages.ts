import { supabase } from '@/lib/supabase';

export type UploadResult = { succeeded: number; failed: number };

export async function uploadProductImages(productId: number, files: File[]): Promise<UploadResult> {
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `${productId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
    if (uploadError) {
      console.error('Image upload failed:', uploadError);
      failed++;
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(path);

    const { error: insertError } = await supabase
      .from('product_images')
      .insert({ product_id: productId, url: publicUrlData.publicUrl, sort_order: i });

    if (insertError) {
      console.error('Saving image record failed:', insertError);
      failed++;
    } else {
      succeeded++;
    }
  }

  return { succeeded, failed };
}