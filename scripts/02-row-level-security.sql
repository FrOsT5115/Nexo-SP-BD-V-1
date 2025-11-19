-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Essential for data protection in Supabase
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- RECIPES POLICIES
-- ============================================
-- Everyone can read recipes (even non-authenticated for preview)
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  USING (true);

-- Only admins can insert/update/delete recipes
-- Note: You'll need to add an is_admin column or use Supabase custom claims
CREATE POLICY "Only service role can modify recipes"
  ON recipes FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- RECIPE COMPLETIONS POLICIES
-- ============================================
-- Users can view their own completions
CREATE POLICY "Users can view own completions"
  ON recipe_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON recipe_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own completions
CREATE POLICY "Users can delete own completions"
  ON recipe_completions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- USER FAVORITES POLICIES
-- ============================================
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- LOGIN HISTORY POLICIES
-- ============================================
-- Users can view their own login history
CREATE POLICY "Users can view own login history"
  ON login_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own login records
CREATE POLICY "Users can insert own login records"
  ON login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER ACHIEVEMENTS POLICIES
-- ============================================
-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert achievements (typically done server-side)
CREATE POLICY "Authenticated users can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
