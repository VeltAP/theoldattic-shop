'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ignore) {
        if (error) {
          console.error('Error loading posts:', error);
          setLoadError('Could not load posts. Try reloading the page.');
        } else {
          setPosts(data ?? []);
          setLoadError(null);
        }
        setLoading(false);
      }
    }

    loadPosts();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  async function deletePost(id: number, title: string) {
    if (!confirm(`Delete "${title}" permanently? This can't be undone.`)) return;

    setDeletingId(id);
    setDeleteError(null);

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Error deleting post:', err);
      setDeleteError(`Could not delete "${title}". Try again.`);
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-12">
        <h1 className="font-display text-2xl text-shop-text mb-6">Manage Blog</h1>
        <p className="text-sm text-shop-text/60">Loading posts…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl text-shop-text">Manage Blog</h1>
        <Link
          href="/admin/blog/new"
          className="bg-shop-accent text-white px-4 py-2 rounded text-sm hover:opacity-90"
        >
          New Post
        </Link>
      </div>

      {loadError && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {loadError}
        </div>
      )}

      {deleteError && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {deleteError}
        </div>
      )}

      {!loadError && posts.length === 0 && (
        <p className="text-sm text-shop-text/50">
          No posts yet — click &quot;New Post&quot; to write your first one.
        </p>
      )}

      {posts.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3"></th>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3 whitespace-nowrap">Created</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const isDeleting = deletingId === post.id;
                return (
                  <tr key={post.id} className={`border-b last:border-b-0 ${isDeleting ? 'opacity-40' : ''}`}>
                    <td className="p-3">
                      {post.cover_image ? (
                        <div className="relative w-14 h-14 rounded overflow-hidden bg-gray-100">
                          <Image src={post.cover_image} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded bg-gray-100" />
                      )}
                    </td>
                    <td className="p-3 font-medium text-shop-text">{post.title}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-shop-text/70">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3 items-center justify-end">
                        {post.published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-shop-text/60 underline text-sm"
                          >
                            View
                          </a>
                        )}
                        <Link href={`/admin/blog/${post.id}`} className="text-shop-accent underline text-sm">
                          Edit
                        </Link>
                        <button
                          onClick={() => deletePost(post.id, post.title)}
                          disabled={isDeleting}
                          className="text-red-600 underline text-sm disabled:text-red-300 disabled:no-underline"
                        >
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}