-- Lost & Found Database Schema
-- PostgreSQL with Supabase Extensions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Create custom types
CREATE TYPE item_status AS ENUM ('available', 'claimed', 'archived');
CREATE TYPE badge_type AS ENUM ('finder_level_1', 'finder_level_2', 'finder_level_3', 'campus_hero', 'helpful_neighbor', 'first_post');
CREATE TYPE leaderboard_period AS ENUM ('weekly', 'monthly', 'all_time');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  points INT DEFAULT 0 CHECK (points >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 100),
  description TEXT CHECK (char_length(description) <= 1000),
  status item_status DEFAULT 'available' NOT NULL,
  location_tag TEXT NOT NULL CHECK (char_length(location_tag) <= 100),
  hashtags TEXT[] DEFAULT '{}',
  posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  is_approved BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_claim CHECK (
    (status = 'claimed' AND claimed_by IS NOT NULL AND claimed_at IS NOT NULL) OR
    (status != 'claimed' AND (claimed_by IS NULL OR claimed_at IS NULL))
  )
);

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  width INT NOT NULL CHECK (width > 0),
  height INT NOT NULL CHECK (height > 0),
  size_bytes INT NOT NULL CHECK (size_bytes > 0),
  order_num INT NOT NULL DEFAULT 0 CHECK (order_num >= 0 AND order_num < 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (item_id, order_num)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hashtags table
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL CHECK (char_length(tag) >= 2 AND char_length(tag) <= 30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item hashtags junction table
CREATE TABLE item_hashtags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, hashtag_id)
);

-- Points history table
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID, -- Can reference item_id or other entity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, badge_type)
);

-- Leaderboard cache table
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 0,
  period leaderboard_period NOT NULL,
  rank INT,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, period, period_start)
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_posted_by ON items(posted_by);
CREATE INDEX idx_items_hashtags ON items USING GIN(hashtags);
CREATE INDEX idx_items_location_tag ON items(location_tag);
CREATE INDEX idx_images_item_id ON images(item_id);
CREATE INDEX idx_comments_item_id ON comments(item_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_leaderboard_period ON leaderboard_cache(period, period_start, rank);
CREATE INDEX idx_hashtags_tag ON hashtags(tag);

-- Full-text search index
CREATE INDEX idx_items_search ON items USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO points (user_id, amount, reason, reference_id)
  VALUES (p_user_id, p_amount, p_reason, p_reference_id);

  UPDATE users
  SET points = points + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  post_count INT;
  current_points INT;
BEGIN
  -- Count user's posts
  SELECT COUNT(*) INTO post_count
  FROM items
  WHERE posted_by = p_user_id;

  -- Get user's points
  SELECT points INTO current_points
  FROM users
  WHERE id = p_user_id;

  -- Award first_post badge
  IF post_count = 1 THEN
    INSERT INTO badges (user_id, badge_type)
    VALUES (p_user_id, 'first_post')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award finder_level_1 badge (10 posts)
  IF post_count >= 10 THEN
    INSERT INTO badges (user_id, badge_type)
    VALUES (p_user_id, 'finder_level_1')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award finder_level_2 badge (25 posts)
  IF post_count >= 25 THEN
    INSERT INTO badges (user_id, badge_type)
    VALUES (p_user_id, 'finder_level_2')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award finder_level_3 badge (50 posts)
  IF post_count >= 50 THEN
    INSERT INTO badges (user_id, badge_type)
    VALUES (p_user_id, 'finder_level_3')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award points on new post
CREATE OR REPLACE FUNCTION on_new_item()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points(NEW.posted_by, 10, 'New post created', NEW.id);
  PERFORM check_and_award_badges(NEW.posted_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_item AFTER INSERT ON items
  FOR EACH ROW EXECUTE FUNCTION on_new_item();

-- Trigger to award points on claim approval
CREATE OR REPLACE FUNCTION on_claim_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'claimed' AND OLD.status != 'claimed' AND NEW.claimed_by IS NOT NULL THEN
    PERFORM award_points(NEW.claimed_by, 20, 'Item claimed', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_claim_approved AFTER UPDATE ON items
  FOR EACH ROW WHEN (NEW.status = 'claimed' AND OLD.status != 'claimed')
  EXECUTE FUNCTION on_claim_approved();

-- Function to auto-archive claimed items after 7 days
CREATE OR REPLACE FUNCTION auto_archive_old_claims()
RETURNS void AS $$
BEGIN
  UPDATE items
  SET status = 'archived', archived_at = NOW()
  WHERE status = 'claimed'
    AND claimed_at IS NOT NULL
    AND claimed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Items are viewable by everyone" ON items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create items" ON items FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Users can update own items" ON items FOR UPDATE USING (auth.uid() = posted_by);
CREATE POLICY "Admins can update any item" ON items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own items" ON items FOR DELETE USING (auth.uid() = posted_by);

-- Images policies
CREATE POLICY "Images are viewable by everyone" ON images FOR SELECT USING (true);
CREATE POLICY "Users can upload images for own items" ON images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM items WHERE id = item_id AND posted_by = auth.uid())
);
CREATE POLICY "Users can delete images from own items" ON images FOR DELETE USING (
  EXISTS (SELECT 1 FROM items WHERE id = item_id AND posted_by = auth.uid())
);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Hashtags policies
CREATE POLICY "Hashtags are viewable by everyone" ON hashtags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hashtags" ON hashtags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Item hashtags policies
CREATE POLICY "Item hashtags are viewable by everyone" ON item_hashtags FOR SELECT USING (true);
CREATE POLICY "Users can add hashtags to own items" ON item_hashtags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM items WHERE id = item_id AND posted_by = auth.uid())
);

-- Points policies
CREATE POLICY "Points are viewable by everyone" ON points FOR SELECT USING (true);

-- Badges policies
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- Leaderboard policies
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard_cache FOR SELECT USING (true);

-- Admins policies
CREATE POLICY "Admins are viewable by everyone" ON admins FOR SELECT USING (true);

-- Push subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);
