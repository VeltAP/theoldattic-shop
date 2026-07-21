import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';
import { requireAdmin } from '@/lib/requireAdmin';

type PostUpdate = Database['public']['Tables']['posts']['Update'];

function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
    },
  });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { title, excerpt, content_html, cover_image, published } = body;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      title,
      slug: makeSlug(title),
      excerpt,
      content_html: cleanHtml(content_html),
      cover_image,
      published: published ?? false,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, title, excerpt, content_html, cover_image, published } = body;

  const updates: PostUpdate = {
    title,
    excerpt,
    content_html: cleanHtml(content_html),
    cover_image,
    published,
    updated_at: new Date().toISOString(),
  };

  if (title) updates.slug = makeSlug(title);
  if (published) updates.published_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}