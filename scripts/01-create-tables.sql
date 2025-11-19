-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- Extends Supabase auth.users with additional profile data
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height DECIMAL(5,2), -- in cm
  weight DECIMAL(5,2), -- in kg (renamed from target_weight to weight)
  target_weight DECIMAL(5,2), -- in kg
  health_issues TEXT[], -- array of health issues
  account_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RECIPES TABLE
-- Admin-managed recipes with categories and difficulty
-- ============================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50) CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time_minutes INTEGER,
  calories INTEGER,
  protein_grams DECIMAL(5,2),
  carbs_grams DECIMAL(5,2),
  fats_grams DECIMAL(5,2),
  ingredients JSONB NOT NULL, -- array of ingredient objects
  steps JSONB NOT NULL, -- array of step strings
  suitable_for_conditions TEXT[], -- health issues this recipe is good for
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RECIPE COMPLETIONS TABLE
-- Tracks when users complete recipes
-- ============================================
CREATE TABLE recipe_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  photo_url TEXT, -- optional photo of completed dish
  notes TEXT,
  UNIQUE(user_id, recipe_id, completed_at) -- allow multiple completions but track each
);

-- ============================================
-- USER FAVORITES TABLE
-- Bookmarked/favorite recipes
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================
-- LOGIN STREAKS TABLE
-- Tracks daily login history for streak calculation
-- ============================================
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, login_date)
);

-- ============================================
-- ACHIEVEMENTS TABLE (Optional)
-- Tracks user achievements like goal completion
-- ============================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) CHECK (achievement_type IN ('goal_completed', 'streak_milestone', 'recipe_master')),
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- additional data like target weight achieved, streak days, etc.
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipe_completions_user ON recipe_completions(user_id);
CREATE INDEX idx_recipe_completions_recipe ON recipe_completions(recipe_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_login_history_user_date ON login_history(user_id, login_date DESC);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update login streak
CREATE OR REPLACE FUNCTION update_login_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_last_login_date DATE;
BEGIN
  -- Get the last login date
  SELECT login_date INTO v_last_login_date
  FROM login_history
  WHERE user_id = p_user_id
  ORDER BY login_date DESC
  LIMIT 1 OFFSET 1; -- Get second most recent (before today)

  -- Calculate streak
  IF v_last_login_date IS NULL OR v_last_login_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    SELECT current_streak + 1 INTO v_current_streak
    FROM user_profiles
    WHERE id = p_user_id;
  ELSE
    -- Streak broken, start new
    v_current_streak := 1;
  END IF;

  -- Update user profile
  UPDATE user_profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = GREATEST(longest_streak, v_current_streak),
    last_login = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get recipe completion count for a user
CREATE OR REPLACE FUNCTION get_recipe_completion_count(p_user_id UUID, p_recipe_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM recipe_completions
  WHERE user_id = p_user_id AND recipe_id = p_recipe_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
