// ============================================
// Example Database Queries
// ============================================

'use server'

import { createServerSupabaseClient } from './server'
import type { Recipe, UserProfile, RecipeCompletion } from './types'

// ============================================
// USER PROFILE QUERIES
// ============================================

export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as UserProfile
}

export async function createUserProfile(profile: {
  id: string
  name: string
  age?: number
  gender?: string
  health_issues?: string[]
  target_weight?: number
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

// ============================================
// RECIPE QUERIES
// ============================================

export async function getAllRecipes() {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Recipe[]
}

export async function getRecipesByCategory(category: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Recipe[]
}

export async function getRecommendedRecipes(healthIssues: string[]) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .overlaps('suitable_for_conditions', healthIssues)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Recipe[]
}

// ============================================
// RECIPE COMPLETION QUERIES
// ============================================

export async function completeRecipe(userId: string, recipeId: string, photoUrl?: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('recipe_completions')
    .insert({
      user_id: userId,
      recipe_id: recipeId,
      photo_url: photoUrl
    })
    .select()
    .single()

  if (error) throw error
  return data as RecipeCompletion
}

export async function getUserCompletions(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('recipe_completions')
    .select(`
      *,
      recipes:recipe_id (*)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getRecipeCompletionCount(userId: string, recipeId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { count, error } = await supabase
    .from('recipe_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) throw error
  return count || 0
}

// ============================================
// FAVORITES QUERIES
// ============================================

export async function addFavorite(userId: string, recipeId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, recipe_id: recipeId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFavorite(userId: string, recipeId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) throw error
}

export async function getUserFavorites(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      *,
      recipes:recipe_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function isFavorite(userId: string, recipeId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { count, error } = await supabase
    .from('user_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) throw error
  return (count || 0) > 0
}

// ============================================
// LOGIN STREAK QUERIES
// ============================================

export async function recordLogin(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Insert login record for today
  const { error: loginError } = await supabase
    .from('login_history')
    .insert({ user_id: userId })
    .select()

  if (loginError && loginError.code !== '23505') { // Ignore duplicate key errors
    throw loginError
  }

  // Call function to update streak
  const { error: streakError } = await supabase
    .rpc('update_login_streak', { p_user_id: userId })

  if (streakError) throw streakError
}

export async function getUserStreak(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
