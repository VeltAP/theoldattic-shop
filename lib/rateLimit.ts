import { supabaseAdmin } from '@/lib/supabaseAdmin';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function checkRateLimit(key: string): Promise<{ allowed: boolean }> {
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  await supabaseAdmin.from('rate_limit_attempts').delete().eq('key', key).lt('created_at', windowStart);

  const { count } = await supabaseAdmin
    .from('rate_limit_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart);

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return { allowed: false };
  }

  await supabaseAdmin.from('rate_limit_attempts').insert({ key });
  return { allowed: true };
}