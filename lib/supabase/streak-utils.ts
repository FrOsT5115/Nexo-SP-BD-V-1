/**
 * Login Streak Management Utilities
 * Handles streak calculation and badge awarding based on Santiago timezone
 */

import { getSantiagoDate, isSantiagoYesterday } from '@/lib/timezone-utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastLoginDate: string | null
  shouldAwardBadge: boolean
}

/**
 * Records a login for today (Santiago timezone) and calculates streak
 * @param supabase Supabase client instance
 * @param userId User ID to record login for
 * @returns Streak data after recording login
 */
export async function recordLoginAndCalculateStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakData> {
  const todaySantiago = getSantiagoDate()
  
  console.log('[v0] Recording login for Santiago date:', todaySantiago)
  
  // Check if user already logged in today (Santiago time)
  const { data: existingLogin } = await supabase
    .from('login_history')
    .select('login_date')
    .eq('user_id', userId)
    .eq('login_date', todaySantiago)
    .single()
  
  if (existingLogin) {
    console.log('[v0] User already logged in today (Santiago time)')
    // Already logged in today, just return current streak
    return await getCurrentStreak(supabase, userId)
  }
  
  // Get all previous logins sorted by date descending
  const { data: loginHistory, error: historyError } = await supabase
    .from('login_history')
    .select('login_date')
    .eq('user_id', userId)
    .order('login_date', { ascending: false })
    .limit(31) // We only need last 31 days for streak calculation
  
  if (historyError) {
    console.error('[v0] Error fetching login history:', historyError)
    throw historyError
  }
  
  // Calculate new streak
  let newStreak = 1
  let shouldAwardBadge = false
  
  if (loginHistory && loginHistory.length > 0) {
    const lastLoginDate = loginHistory[0].login_date
    
    console.log('[v0] Last login date:', lastLoginDate)
    
    // Check if last login was yesterday (Santiago time)
    if (isSantiagoYesterday(lastLoginDate)) {
      // Continue streak
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_streak')
        .eq('id', userId)
        .single()
      
      const previousStreak = profile?.current_streak || 0
      newStreak = previousStreak + 1
      
      console.log('[v0] Continuing streak. Previous:', previousStreak, 'New:', newStreak)
      
      // Check if we've completed a 31-day cycle
      if (newStreak > 31) {
        console.log('[v0] Completed 31-day cycle! Resetting to 1 and awarding badge')
        shouldAwardBadge = true
        newStreak = 1 // Reset to 1 after reaching 31
      } else if (newStreak === 31) {
        console.log('[v0] Reached exactly 31 days! Will award badge')
        shouldAwardBadge = true
      }
    } else {
      console.log('[v0] Streak broken. Last login was not yesterday. Starting new streak at 1')
      newStreak = 1
    }
  } else {
    console.log('[v0] First login ever. Starting streak at 1')
    newStreak = 1
  }
  
  // Record today's login in Santiago time
  const { error: insertError } = await supabase
    .from('login_history')
    .insert({
      user_id: userId,
      login_date: todaySantiago
    })
  
  if (insertError) {
    console.error('[v0] Error recording login:', insertError)
    throw insertError
  }
  
  // Update user profile with new streak
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('longest_streak')
    .eq('id', userId)
    .single()
  
  const longestStreak = Math.max(profile?.longest_streak || 0, newStreak)
  
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_login: new Date().toISOString()
    })
    .eq('id', userId)
  
  if (updateError) {
    console.error('[v0] Error updating profile:', updateError)
    throw updateError
  }
  
  // Award badge if completed 31-day streak
  if (shouldAwardBadge) {
    await awardStreakBadge(supabase, userId)
  }
  
  return {
    currentStreak: newStreak,
    longestStreak,
    lastLoginDate: todaySantiago,
    shouldAwardBadge
  }
}

/**
 * Gets the current streak data for a user
 * @param supabase Supabase client instance
 * @param userId User ID to get streak for
 * @returns Current streak data
 */
export async function getCurrentStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakData> {
  const todaySantiago = getSantiagoDate()
  
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('current_streak, longest_streak, last_login')
    .eq('id', userId)
    .single()
  
  if (profileError) {
    console.error('[v0] Error fetching profile:', profileError)
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      shouldAwardBadge: false
    }
  }
  
  const { data: lastLogin } = await supabase
    .from('login_history')
    .select('login_date')
    .eq('user_id', userId)
    .order('login_date', { ascending: false })
    .limit(1)
    .single()
  
  let currentStreak = profile?.current_streak || 0
  const longestStreak = profile?.longest_streak || 0
  
  if (lastLogin?.login_date && lastLogin.login_date !== todaySantiago) {
    // Check if last login was yesterday
    if (!isSantiagoYesterday(lastLogin.login_date)) {
      // User missed a day, reset streak to 0 until they login again
      console.log('[v0] User missed a day. Last login:', lastLogin.login_date, 'Today:', todaySantiago)
      currentStreak = 0
      
      // Update the database to reflect the broken streak
      await supabase
        .from('user_profiles')
        .update({ current_streak: 0 })
        .eq('id', userId)
    }
  }
  
  console.log('[v0] Current streak from database:', currentStreak)
  console.log('[v0] Longest streak from database:', longestStreak)
  
  return {
    currentStreak,
    longestStreak,
    lastLoginDate: lastLogin?.login_date || null,
    shouldAwardBadge: false
  }
}

/**
 * Awards the 31-day streak master badge to a user
 * @param supabase Supabase client instance
 * @param userId User ID to award badge to
 */
async function awardStreakBadge(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  console.log('[v0] Awarding 31-day streak badge to user:', userId)
  
  // Check if badge already exists
  const { data: existingBadge } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_type', 'streak_milestone')
    .eq('achievement_name', '31 Dias de Buena Salud')
    .single()
  
  if (existingBadge) {
    console.log('[v0] User already has this badge')
    return
  }
  
  // Insert the badge
  const { error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_type: 'streak_milestone',
      achievement_name: '31 Dias de Buena Salud',
      description: '¡Inicio sesión 31 días seguidos!',
      metadata: {
        streak_days: 31,
        awarded_date: getSantiagoDate()
      }
    })
  
  if (error) {
    console.error('[v0] Error awarding badge:', error)
  } else {
    console.log('[v0] Badge awarded successfully!')
  }
}

/**
 * Gets all login dates for visualization
 * @param supabase Supabase client instance
 * @param userId User ID
 * @returns Array of login dates in YYYY-MM-DD format
 */
export async function getLoginDates(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('login_history')
    .select('login_date')
    .eq('user_id', userId)
    .order('login_date', { ascending: false })
    .limit(31)
  
  if (error) {
    console.error('[v0] Error fetching login dates:', error)
    return []
  }
  
  return data?.map(row => row.login_date) || []
}
