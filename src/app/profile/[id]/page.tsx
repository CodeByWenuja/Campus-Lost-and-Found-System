'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { UserWithStats, Badge as BadgeType, Item } from '@/types/database';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserWithStats | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchBadges();
      fetchUserItems();
    }
  }, [userId]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBadges() {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }

  async function fetchUserItems() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, images(*)')
        .eq('posted_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-apple"></div>
          <div className="h-64 bg-gray-200 rounded-apple"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
        <Link href="/" className="text-primary-600 hover:text-primary-700">
          Go back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-apple shadow-apple p-8 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.display_name}</h1>
            <p className="text-gray-600">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{profile.points}</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{badges.length}</div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges</h2>
            <div className="flex flex-wrap gap-4">
              {badges.map(badge => (
                <Badge key={badge.id} badgeType={badge.badge_type} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User's Posts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Posted Items</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <Card key={item.id} item={item as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-apple shadow-apple">
            <p className="text-gray-600">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
