import { cache } from 'react';
import { supabase } from '@/lib/supabase';

export const getProduct = cache(async (slug: string) => {
  const { data } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order), categories(name, slug)')
    .eq('slug', slug)
    .single();
  return data;
});