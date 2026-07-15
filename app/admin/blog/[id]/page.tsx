'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

export default function AdminBlogEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: '',
    immediatelyRender: false,
  });

useEffect(() => {
  if (isNew || !editor) return;

  const activeEditor = editor;
  let ignore = false;

  async function loadPost() {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', Number(params.id))
      .single();

    if (!ignore && data) {
      setPost(data);
      setTitle(data.title);
      setExcerpt(data.excerpt ?? '');
      setCoverImage(data.cover_image ?? '');
      setPublished(data.published ?? false);
      activeEditor.commands.setContent(data.content_html);
    }
    if (!ignore) setLoading(false);
  }

  loadPost();

  return () => {
    ignore = true;
  };
}, [isNew, params.id, editor]);

  async function handleCoverUpload(file: File) {
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('blog-images').upload(path, file);
    if (uploadError) {
      console.error('cover upload failed:', uploadError);
      return;
    }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    setCoverImage(data.publicUrl);
  }

  async function handleInlineImageUpload(file: File) {
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('blog-images').upload(path, file);
    if (uploadError) {
      console.error('inline image upload failed:', uploadError);
      return;
    }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    editor?.chain().focus().setImage({ src: data.publicUrl }).run();
  }

  async function handleSave() {
    if (!editor) return;
    setSaving(true);

    const body = {
      id: post?.id,
      title,
      excerpt,
      content_html: editor.getHTML(),
      cover_image: coverImage,
      published,
    };

    const response = await fetch('/api/admin/blog', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (response.ok) {
      router.push('/admin/blog');
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto mt-12 pb-20">
      <h1 className="font-display text-2xl text-shop-text mb-6">
        {isNew ? 'New Post' : 'Edit Post'}
      </h1>

      <label className="block text-sm mb-1">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <label className="block text-sm mb-1">Excerpt</label>
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        rows={2}
        className="border p-2 rounded w-full mb-4"
      />

      <label className="block text-sm mb-1">Cover image</label>
      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt="" className="w-full h-40 object-cover rounded mb-2" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
        className="border p-2 rounded w-full mb-4 text-sm"
      />

      <label className="block text-sm mb-1">Content</label>
      <div className="border rounded mb-2">
        <div className="border-b p-2 flex gap-2 text-sm flex-wrap">
          <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="border px-2 py-1 rounded">Bold</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className="border px-2 py-1 rounded">Italic</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="border px-2 py-1 rounded">H2</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className="border px-2 py-1 rounded">List</button>
          <label className="border px-2 py-1 rounded cursor-pointer">
            Insert image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleInlineImageUpload(e.target.files[0])}
            />
          </label>
        </div>
        <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px]" />
      </div>

      <label className="flex items-center gap-2 mb-6">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-shop-accent text-white px-6 py-3 rounded"
      >
        {saving ? 'Saving…' : 'Save post'}
      </button>
    </div>
  );
}