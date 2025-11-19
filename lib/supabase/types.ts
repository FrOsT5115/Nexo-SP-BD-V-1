// ============================================
// TypeScript Interfaces for Database Schema
// ============================================

export interface UserProfile {
  id: string // UUID from auth.users
  name: string
  age?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  target_weight?: number
  health_issues?: string[]
  account_created: string // ISO timestamp
  last_login: string // ISO timestamp
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  title: string
  description?: string
  image_url?: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  difficulty: 'easy' | 'medium' | 'hard'
  prep_time_minutes?: number
  calories?: number
  protein_grams?: number
  carbs_grams?: number
  fats_grams?: number
  ingredients: string[] // JSONB array
  steps: string[] // JSONB array
  suitable_for_conditions?: string[]
  created_at: string
  updated_at: string
}

export interface RecipeCompletion {
  id: string
  user_id: string
  recipe_id: string
  completed_at: string
  photo_url?: string
  notes?: string
}

export interface UserFavorite {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
}

export interface LoginHistory {
  id: string
  user_id: string
  login_date: string // Date format
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: 'goal_completed' | 'streak_milestone' | 'recipe_master'
  achievement_name: string
  description?: string
  achieved_at: string
  metadata?: Record<string, any>
}

// Helper types for inserts (without auto-generated fields)
export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'current_streak' | 'longest_streak'>
export type RecipeCompletionInsert = Omit<RecipeCompletion, 'id' | 'completed_at'>
export type UserFavoriteInsert = Omit<UserFavorite, 'id' | 'created_at'>
