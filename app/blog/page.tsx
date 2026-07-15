import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 9;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: posts, count } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, cover_image, published_at', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-shop-text mb-10 text-center">Blog</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(posts ?? []).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="border border-gray-300 rounded overflow-hidden hover:opacity-90"
          >
            {post.cover_image && (
              <div className="w-full h-40 relative">
                <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-display text-lg mb-1">{post.title}</h2>
              {post.excerpt && <p className="text-sm text-shop-text/70">{post.excerpt}</p>}
              {post.published_at && (
                <p className="text-xs text-shop-text/50 mt-2">
                  {new Date(post.published_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {(posts ?? []).length === 0 && <p className="text-center text-shop-text/60">No posts yet.</p>}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`px-3 py-1 rounded border ${p === page ? 'bg-shop-accent text-white' : ''}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}