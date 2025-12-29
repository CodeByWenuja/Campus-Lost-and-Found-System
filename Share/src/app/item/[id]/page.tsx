'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ItemWithDetails, CommentWithUser, Image } from '@/types/database';
import { ImageCarousel } from '@/components/ImageCarousel';
import Link from 'next/link';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchItem();
      fetchComments();
    }
  }, [itemId]);

  async function fetchItem() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(
          `
          *,
          poster:users!items_posted_by_fkey(id, display_name, avatar_url, points),
          claimer:users!items_claimed_by_fkey(id, display_name, avatar_url),
          images(*)
        `
        )
        .eq('id', itemId)
        .single();

      if (error) throw error;

      // Sort images by order
      if (data.images) {
        data.images.sort((a: Image, b: Image) => a.order_num - b.order_num);
      }

      setItem(data as unknown as ItemWithDetails);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:users(id, display_name, avatar_url)')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as unknown as CommentWithUser[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  async function handleClaim() {
    if (!isAuthenticated || !item) return;

    try {
      const { error } = await supabase
        .from('items')
        .update({
          claimed_by: user!.id,
          claimed_at: new Date().toISOString(),
          status: 'claimed'
        })
        .eq('id', itemId);

      if (error) throw error;

      fetchItem();
      alert('Item claimed successfully! The poster will be notified.');
    } catch (error: any) {
      console.error('Error claiming item:', error);
      alert(error.message || 'Failed to claim item');
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('comments').insert({
        item_id: itemId,
        user_id: user!.id,
        text: newComment.trim()
      });

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      alert(error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isAuthenticated || !item || item.posted_by !== user?.id) return;

    const isConfirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      // Delete images from storage
      if (item.images && item.images.length > 0) {
        const filePaths = item.images.map(img => img.storage_path);
        const { error: storageError } = await supabase.storage.from('images').remove(filePaths);
        if (storageError) {
          console.error('Error deleting images from storage:', storageError);
          // Decide if you want to proceed with DB deletion even if storage fails
        }
      }

      // Delete the item from the database
      const { error: dbError } = await supabase.from('items').delete().eq('id', itemId);

      if (dbError) throw dbError;

      alert('Post deleted successfully.');
      router.push('/');

    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 aspect-[4/3] rounded-apple"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
        <button
          onClick={() => router.push('/')}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back to feed
        </button>
      </div>
    );
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    claimed: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  const canClaim = isAuthenticated && item.status === 'available' && item.posted_by !== user?.id;
  const isOwner = isAuthenticated && item.posted_by === user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <div>
          <ImageCarousel images={item.images || []} />
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusColors[item.status]}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>

          {/* Description */}
          {item.description && (
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">Found at:</span>
            <span>{item.location_tag}</span>
          </div>

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Posted by */}
          {item.poster && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Link href={`/profile/${item.poster.id}`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold cursor-pointer">
                  {item.poster.display_name.charAt(0).toUpperCase()}
                </div>
              </Link>
              <div>
                <p className="text-sm text-gray-500">Posted by</p>
                <Link href={`/profile/${item.poster.id}`}>
                  <p className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                    {item.poster.display_name}
                  </p>
                </Link>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-4">
            {canClaim && (
              <button
                onClick={handleClaim}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Claim This Item
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
          </div>

          {item.status === 'claimed' && item.claimer && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Claimed by <span className="font-semibold">{item.claimer.display_name}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{newComment.length}/500</span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              <Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>{' '}
              to leave a comment
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 p-4 bg-white rounded-lg shadow-apple">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {comment.user?.display_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{comment.user?.display_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
