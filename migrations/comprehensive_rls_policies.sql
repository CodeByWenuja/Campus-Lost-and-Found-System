-- Comprehensive RLS Policies for Lost & Found App
-- This file sets up proper security policies while allowing necessary operations

-- First, ensure RLS is enabled on all tables
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

-- Drop all existing policies to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
    END LOOP;
END $$;

-- ==============================================
-- USERS TABLE POLICIES
-- ==============================================

-- Everyone can view user profiles
CREATE POLICY "users_select_policy" ON users
    FOR SELECT
    USING (true);

-- Users can insert their own profile (for signup)
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "users_delete_policy" ON users
    FOR DELETE
    USING (auth.uid() = id);

-- ==============================================
-- ITEMS TABLE POLICIES
-- ==============================================

-- Everyone can view items
CREATE POLICY "items_select_policy" ON items
    FOR SELECT
    USING (true);

-- Authenticated users can create items
CREATE POLICY "items_insert_policy" ON items
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = posted_by);

-- Users can update their own items OR admins can update any item
CREATE POLICY "items_update_policy" ON items
    FOR UPDATE
    USING (
        auth.uid() = posted_by
        OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = posted_by
        OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Users can delete their own items
CREATE POLICY "items_delete_policy" ON items
    FOR DELETE
    USING (auth.uid() = posted_by);

-- ==============================================
-- IMAGES TABLE POLICIES
-- ==============================================

-- Everyone can view images
CREATE POLICY "images_select_policy" ON images
    FOR SELECT
    USING (true);

-- Users can upload images for their own items
CREATE POLICY "images_insert_policy" ON images
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM items
            WHERE items.id = images.item_id
            AND items.posted_by = auth.uid()
        )
    );

-- Users can update images for their own items
CREATE POLICY "images_update_policy" ON images
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM items
            WHERE items.id = images.item_id
            AND items.posted_by = auth.uid()
        )
    );

-- Users can delete images from their own items
CREATE POLICY "images_delete_policy" ON images
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM items
            WHERE items.id = images.item_id
            AND items.posted_by = auth.uid()
        )
    );

-- ==============================================
-- COMMENTS TABLE POLICIES
-- ==============================================

-- Everyone can view comments
CREATE POLICY "comments_select_policy" ON comments
    FOR SELECT
    USING (true);

-- Authenticated users can create comments
CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_policy" ON comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- HASHTAGS TABLE POLICIES
-- ==============================================

-- Everyone can view hashtags
CREATE POLICY "hashtags_select_policy" ON hashtags
    FOR SELECT
    USING (true);

-- Authenticated users can create hashtags
CREATE POLICY "hashtags_insert_policy" ON hashtags
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================
-- ITEM_HASHTAGS TABLE POLICIES
-- ==============================================

-- Everyone can view item hashtags
CREATE POLICY "item_hashtags_select_policy" ON item_hashtags
    FOR SELECT
    USING (true);

-- Users can add hashtags to their own items
CREATE POLICY "item_hashtags_insert_policy" ON item_hashtags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM items
            WHERE items.id = item_hashtags.item_id
            AND items.posted_by = auth.uid()
        )
    );

-- Users can remove hashtags from their own items
CREATE POLICY "item_hashtags_delete_policy" ON item_hashtags
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM items
            WHERE items.id = item_hashtags.item_id
            AND items.posted_by = auth.uid()
        )
    );

-- ==============================================
-- POINTS TABLE POLICIES
-- ==============================================

-- Everyone can view points (for leaderboard)
CREATE POLICY "points_select_policy" ON points
    FOR SELECT
    USING (true);

-- Only system (via functions) can insert points - no direct INSERT allowed
-- This is handled by the award_points function with SECURITY DEFINER

-- ==============================================
-- BADGES TABLE POLICIES
-- ==============================================

-- Everyone can view badges
CREATE POLICY "badges_select_policy" ON badges
    FOR SELECT
    USING (true);

-- Only system (via functions) can insert badges - no direct INSERT allowed
-- This is handled by the check_and_award_badges function with SECURITY DEFINER

-- ==============================================
-- LEADERBOARD_CACHE TABLE POLICIES
-- ==============================================

-- Everyone can view leaderboard
CREATE POLICY "leaderboard_select_policy" ON leaderboard_cache
    FOR SELECT
    USING (true);

-- Only system can manage leaderboard cache
-- No public INSERT/UPDATE/DELETE policies needed

-- ==============================================
-- ADMINS TABLE POLICIES
-- ==============================================

-- Everyone can view who admins are
CREATE POLICY "admins_select_policy" ON admins
    FOR SELECT
    USING (true);

-- Only existing admins can create new admins
CREATE POLICY "admins_insert_policy" ON admins
    FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- ==============================================
-- PUSH_SUBSCRIPTIONS TABLE POLICIES
-- ==============================================

-- Users can view their own subscriptions
CREATE POLICY "push_subscriptions_select_policy" ON push_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "push_subscriptions_insert_policy" ON push_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "push_subscriptions_update_policy" ON push_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "push_subscriptions_delete_policy" ON push_subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- AUTOMATIC USER PROFILE CREATION
-- ==============================================

-- Create a function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url, points)
  VALUES (
    NEW.id,
    COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- GRANT NECESSARY PERMISSIONS
-- ==============================================

-- Ensure authenticated users can execute necessary functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_points(UUID, INT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges(UUID) TO authenticated;
