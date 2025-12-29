export type ItemStatus = 'available' | 'claimed' | 'archived';
export type BadgeType =
  | 'finder_level_1'
  | 'finder_level_2'
  | 'finder_level_3'
  | 'campus_hero'
  | 'helpful_neighbor'
  | 'first_post';
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  points: number;
  updated_at: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  location_tag: string;
  hashtags: string[];
  posted_by: string;
  claimed_by?: string;
  created_at: string;
  claimed_at?: string;
  archived_at?: string;
  is_approved: boolean;
  updated_at: string;
}

export interface Image {
  id: string;
  item_id: string;
  storage_path: string;
  width: number;
  height: number;
  size_bytes: number;
  order_num: number;
  created_at: string;
}

export interface Comment {
  id: string;
  item_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Hashtag {
  id: string;
  tag: string;
  created_at: string;
}

export interface Point {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_id?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  awarded_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  points: number;
  period: LeaderboardPeriod;
  rank?: number;
  period_start: string;
  period_end: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface ItemWithDetails extends Item {
  poster?: User;
  claimer?: User;
  images?: Image[];
  comments?: CommentWithUser[];
}

export interface CommentWithUser extends Comment {
  user?: User;
}

export interface UserWithStats extends User {
  badges?: Badge[];
  total_posts?: number;
  total_claims?: number;
}
