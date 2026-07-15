'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (!ignore) {
        setPosts(data ?? []);
        setLoading(false);
      }
    }

    loadPosts();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  async function deletePost(id: number) {
    if (!confirm('Delete this post permanently?')) return;

    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setRefreshKey((k) => k + 1);
  }

  if (loading) return <p>Loading posts…</p>;

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl text-shop-text">Manage Blog</h1>
        <Link href="/admin/blog/new" className="bg-shop-accent text-white px-4 py-2 rounded">
          New Post
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Title</th>
            <th className="p-2">Published</th>
            <th className="p-2">Created</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b">
              <td className="p-2">{post.title}</td>
              <td className="p-2">{post.published ? 'Yes' : 'Draft'}</td>
              <td className="p-2">{new Date(post.created_at ?? '').toLocaleDateString()}</td>
              <td className="p-2 flex gap-3">
                <Link href={`/admin/blog/${post.id}`} className="text-shop-accent underline">
                  Edit
                </Link>
                <button onClick={() => deletePost(post.id)} className="text-red-600 underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}