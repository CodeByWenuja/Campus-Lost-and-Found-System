'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ItemWithDetails } from '@/types/database';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, [user]);

  async function checkAdmin() {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      fetchPendingItems();
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPendingItems() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, poster:users!items_posted_by_fkey(display_name), images(*)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data as unknown as ItemWithDetails[]);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    }
  }

  async function approveItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_approved: true })
        .eq('id', itemId);

      if (error) throw error;
      fetchPendingItems();
    } catch (error: any) {
      alert(error.message || 'Failed to approve item');
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) throw error;
      fetchPendingItems();
    } catch (error: any) {
      alert(error.message || 'Failed to delete item');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <button
          onClick={() => router.push('/')}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage pending items and user reports</p>
      </div>

      <div className="bg-white rounded-apple shadow-apple p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Pending Approvals ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No pending items</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => {
              const firstImage = item.images?.[0];
              const imageUrl = firstImage
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${firstImage.storage_path}`
                : '/placeholder.png';

              return (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By: {item.poster?.display_name}</span>
                      <span>Location: {item.location_tag}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => approveItem(item.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
