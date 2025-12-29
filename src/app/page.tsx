'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ItemWithDetails } from '@/types/database';
import { Card } from '@/components/Card';
import { Leaderboard } from '@/components/Leaderboard';

export default function HomePage() {
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchItems();
  }, [page]);

  async function fetchItems() {
    try {
      setLoading(true);
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('items')
        .select(
          `
          *,
          poster:users!items_posted_by_fkey(id, display_name, avatar_url),
          images(id, storage_path, order_num),
          comments(id)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const itemsWithDetails = data as unknown as ItemWithDetails[];

      setItems(prev => (page === 0 ? itemsWithDetails : [...prev, ...itemsWithDetails]));
      setHasMore(count ? from + data.length < count : false);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lost & Found Feed</h1>
            <p className="text-gray-600">Browse items found around campus</p>
          </div>

          {loading && page === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[4/3] rounded-apple mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(item => (
                  <Card key={item.id} item={item} />
                ))}
              </div>

              {items.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
                  <p className="text-gray-600">Be the first to post a found item!</p>
                </div>
              )}

              {hasMore && !loading && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              {loading && page > 0 && (
                <div className="mt-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Leaderboard />

            {/* Quick Stats */}
            <div className="bg-white rounded-apple shadow-apple p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-semibold text-gray-900">{items.length}+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Returned</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
