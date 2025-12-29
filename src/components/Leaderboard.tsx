'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { UserWithStats } from '@/types/database';
import Link from 'next/link';

interface LeaderboardProps {
  period?: 'weekly' | 'monthly' | 'all_time';
  limit?: number;
}

export function Leaderboard({ period = 'weekly', limit = 10 }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, [period]);

  async function fetchLeaders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-apple shadow-apple p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-apple shadow-apple p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>🏆</span>
        <span>Leaderboard</span>
      </h2>

      <div className="space-y-3">
        {leaders.map((user, index) => {
          const rankEmoji = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
          const rankColor =
            index === 0
              ? 'text-yellow-500'
              : index === 1
              ? 'text-gray-400'
              : index === 2
              ? 'text-orange-600'
              : 'text-gray-600';

          return (
            <Link key={user.id} href={`/profile/${user.id}`}>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <span className={`text-2xl ${rankColor} w-8 flex-shrink-0`}>{rankEmoji}</span>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{user.display_name}</div>
                  <div className="text-sm text-gray-500">{user.points} points</div>
                </div>

                {index < 3 && (
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Top {index + 1}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {leaders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No data available yet</p>
        </div>
      )}
    </div>
  );
}
