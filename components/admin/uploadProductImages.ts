import { supabase } from '@/lib/supabase';

export type UploadResult = { succeeded: number; failed: number };

// Previously this logic lived inline in the page component and was passed
// down as a prop function to the edit modal. Pulling it out here means the
// add-product flow and the edit-product flow both call the exact same
// upload logic directly, rather than one of them depending on a function
// handed down through props from a component two levels up.
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