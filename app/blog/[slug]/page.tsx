import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ShareButtons } from '@/components/ShareButtons';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {post.cover_image && (
        <div className="w-full h-64 relative mb-8 rounded overflow-hidden">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <h1 className="font-display text-3xl md:text-4xl text-shop-text mb-3">{post.title}</h1>

      {post.published_at && (
        <p className="text-sm text-shop-text/50 mb-4">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      )}

      <div className="mb-8">
        <ShareButtons
          url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`}
          title={post.title}
          image={post.cover_image ?? undefined}
        />
      </div>

      <div
        className="prose max-w-none font-body text-shop-text/90"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />
    </div>
  );
}