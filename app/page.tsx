"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Leaf, ArrowRight, Mail, Lock, User, Eye, EyeOff, Activity, Heart, Award, ChevronLeft, Upload, CheckCircle2, Calculator, Edit, Target, ArrowLeft, Trash2, AlertCircle, Check, Trophy, LogIn, ChefHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { recordLoginAndCalculateStreak, getCurrentStreak, getLoginDates, type StreakData } from '@/lib/supabase/streak-utils'

// Placeholder for recipes from database
const initialRecipes = [
  {
    id: 1,
    name: "Pollo a la Plancha con Puré de Papa y Verduras al Vapor",
    image: "/0191e788-9eb6-7ed1-bc69-39875195ce8e.jpeg",
    description:
      "Este plato combina la jugosidad del pollo a la plancha con un suave puré de papa y verduras al vapor, creando una comida equilibrada y deliciosa.",
    ingredients: [
      "4 pechugas de pollo",
      "2 cucharadas aceite de oliva",
      "Sal al gusto",
      "4 papas medianas",
      "½ taza de leche",
      "2 cucharadas mantequilla",
      "1 zanahoria",
      "1 taza de brócoli",
    ],
    steps: [
      "Lava y seca todas las verduras a fondo",
      "Combina las verduras mixtas en un tazón grande",
      "Agrega tomates cherry, pepino, cebolla y pimiento",
      "En un tazón pequeño, mezcla el aceite de oliva y vinagre balsámico",
      "Rocía el aderezo sobre la ensalada y mezcla suavemente",
      "Sazona con sal y pimienta al gusto",
      "Sirve inmediatamente y disfruta",
    ],
  },
  {
    id: 2,
    name: "Bowl de Smoothie Verde Energizante",
    image: "/vibrant-green-smoothie-bowl-with-berries-and-grano.jpg",
    description:
      "Repleto de espinacas, bayas y granola. Un desayuno refrescante que energiza tu día con nutrientes esenciales.",
    ingredients: [
      "2 tazas de espinacas frescas",
      "1 plátano, congelado",
      "1/2 taza de bayas mixtas",
      "1/2 taza de leche de almendras",
      "1 cucharada de semillas de chía",
      "1/4 taza de granola",
      "Bayas frescas para decorar",
      "1 cucharada de miel (opcional)",
    ],
    steps: [
      "Agrega espinacas, plátano congelado y bayas a la licuadora",
      "Vierte la leche de almendras",
      "Licúa a alta velocidad hasta obtener una mezcla suave y cremosa",
      "Vierte en un tazón",
      "Decora con granola, bayas frescas y semillas de chía",
      "Rocía con miel si lo deseas",
      "Sirve inmediatamente",
    ],
  },
  {
    id: 3,
    name: "Bowl de Pollo a la Parrilla con Proteínas",
    image: "/grilled-chicken-salad-with-mixed-greens-avocado-an.jpg",
    description:
      "Pollo tierno a la parrilla con verduras mixtas, aguacate y un aderezo cítrico. Alto en proteínas e increíblemente satisfactorio.",
    ingredients: [
      "2 pechugas de pollo",
      "2 tazas de verduras mixtas",
      "1 aguacate, rebanado",
      "1/2 taza de tomates cherry",
      "1/4 taza de granos de maíz",
      "2 cucharadas aceite de oliva",
      "1 lima, exprimida",
      "1 cucharadita de comino",
      "Sal y pimienta al gusto",
    ],
    steps: [
      "Sazona las pechugas de pollo con comino, sal y pimienta",
      "Calienta la parrilla o sartén para parrilla a fuego medio-alto",
      "Asa el pollo durante 6-7 minutos por lado hasta que esté completamente cocido",
      "Deja reposar el pollo durante 5 minutos, luego rebana",
      "Coloca las verduras mixtas en un tazón",
      "Agrega el pollo rebanado, aguacate, tomates y maíz encima",
      "Rocía con aceite de oliva y jugo de lima",
      "Sirve tibio y disfruta",
    ],
  },
]

export default function HealthyRecipesWelcome() {
  const [supabase, setSupabase] = useState<any>(null)
  const [supabaseError, setSupabaseError] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [recipes, setRecipes] = useState<any[]>([])
  const [recipesLoading, setRecipesLoading] = useState(true)
  
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    shouldAwardBadge: false
  })
  const [loginDates, setLoginDates] = useState<string[]>([])
  const [userBadges, setUserBadges] = useState<any[]>([])
  
  const [completedGoals, setCompletedGoals] = useState<any[]>([])
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const [targetWeight, setTargetWeight] = useState<number | null>(null)

  const [showGoalCompleteModal, setShowGoalCompleteModal] = useState(false)
  const [isCompletingGoal, setIsCompletingGoal] = useState(false)

  const [justLoggedIn, setJustLoggedIn] = useState(false)

  // First effect: Initialize Supabase once on mount
  // useEffect(() => {
  //   const client = createClient()
  //   setSupabase(client)
    
  //   // Set initial screen to welcome
  //   setCurrentScreen("welcome")
  //   setIsLoggedIn(false)
  // }, []) // Only run once on mount

  // Replaced with initializeSupabase
  useEffect(() => {
    const initializeSupabase = async () => {
      const client = createClient()
      setSupabase(client)

      const { data: { session } } = await client.auth.getSession()

      if (session && justLoggedIn) {
        const userId = session.user.id
        setCurrentUser(userId)
        setIsLoggedIn(true)

        await Promise.all([
          loadUserProfile(userId, client),
          loadUserBadges(userId, client),
          loadCompletedGoals(userId, client),
          loadStreakData(userId, client),
          loadCompletedRecipes(userId, client) // Add completed recipes loading
        ])

        setCurrentScreen('recipes')
        setJustLoggedIn(false)
      } else {
        setCurrentScreen('welcome')
        setIsLoggedIn(false)
        setCurrentUser(null)
      }
    }

    initializeSupabase()
  }, []) // This effect now depends on `justLoggedIn` which is implicitly handled by the component logic. If `justLoggedIn` changes, the effect will re-run.


  // Second effect: Handle post-login redirect and data loading
  useEffect(() => {
    if (!justLoggedIn || !supabase) return

    const loadUserDataAfterLogin = async () => {
      console.log("[v0] User just logged in, loading data...")
      
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("[v0] Session found, loading user data...")
        setCurrentUser(session.user)
        setIsLoggedIn(true)
        await loadUserProfile(session.user.id, supabase)
        await loadUserBadges(session.user.id, supabase)
        await loadCompletedGoals(session.user.id, supabase)
        await loadCompletedRecipes(session.user.id, supabase) // Load completed recipes after login
        await loadStreakData(session.user.id)
        setCurrentScreen("recipes")
        console.log("[v0] Redirecting to recipes screen")
        setJustLoggedIn(false) // Reset flag
      }
    }

    loadUserDataAfterLogin()
  }, [justLoggedIn, supabase])
  
  useEffect(() => {
    if (supabase) {
      loadRecipes()
      // Load initial data if user is already logged in on mount (e.g., session persists)
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setCurrentUser(data.session.user);
          setIsLoggedIn(true);
          await loadUserProfile(data.session.user.id, supabase);
          await loadUserBadges(data.session.user.id, supabase);
          await loadCompletedGoals(data.session.user.id, supabase);
          await loadCompletedRecipes(data.session.user.id, supabase); // Load completed recipes
          await loadStreakData(data.session.user.id);
        }
      };
      checkSession();
    }
  }, [supabase])
  
  const loadRecipes = async () => {
    if (!supabase) return
    
    try {
      console.log('[v0] Loading recipes from database...')
      setRecipesLoading(true)
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[v0] Error loading recipes:', error)
        setRecipes([]) // Use empty array if error
        return
      }
      
      console.log('[v0] Recipes loaded:', data?.length || 0)
      
      const mappedRecipes = (data || []).map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image_url,
        description: recipe.description,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        category: recipe.category,
        difficulty: recipe.difficulty,
        prep_time_minutes: recipe.prep_time_minutes,
        calories: recipe.calories,
      }))
      
      setRecipes(mappedRecipes)
    } catch (err) {
      console.error('[v0] Unexpected error loading recipes:', err)
      setRecipes([])
    } finally {
      setRecipesLoading(false)
    }
  }

  const [completedRecipes, setCompletedRecipes] = useState<number[]>([])
  const [completedRecipeDetails, setCompletedRecipeDetails] = useState<any[]>([])

  const loadCompletedRecipes = async (userId: string, client?: any) => {
    const supabaseClient = client || supabase
    if (!supabaseClient) {
      console.log('[v0] Cannot load completed recipes - Supabase client not initialized')
      return
    }

    const { data, error } = await supabaseClient
      .from('recipe_completions')
      .select(`
        id,
        recipe_id,
        photo_url,
        completed_at,
        notes,
        recipes (
          id,
          title,
          image_url,
          description
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.log('[v0] Error loading completed recipes:', error)
      return
    }

    if (data) {
      // Store both recipe IDs and full details
      const completedIds = data.map((completion: any) => completion.recipe_id)
      setCompletedRecipes(completedIds)
      setCompletedRecipeDetails(data)
      console.log('[v0] Loaded completed recipes:', data.length)
    }
  }

  const [currentScreen, setCurrentScreen] = useState<
    "welcome" | "recipes" | "form" | "health" | "profile" | "achievements" | "recipeDetail" | "bmi" | "editProfile"
  >("welcome")
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  // const [completedRecipes, setCompletedRecipes] = useState<number[]>([]) // Moved up
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  // Health form data state
  const [healthData, setHealthData] = useState({
    age: "",
    weight: "",
    height: "",
    healthIssues: "",
  })

  const [bmiData, setBmiData] = useState({
    weight: "",
    height: "",
  })

  const [bmiResult, setBmiResult] = useState<{
    value: number
    category: string
    idealWeightRange: { min: number; max: number }
  } | null>(null)
  const [showSaveGoalButton, setShowSaveGoalButton] = useState(false)
  const [showAchievementButton, setShowAchievementButton] = useState(false)

  const loadUserProfile = async (userId: string, client?: any) => {
    const supabaseClient = client || supabase
    
    if (!supabaseClient) {
      console.error('[v0] Cannot load profile - Supabase client not initialized')
      return
    }

    try {
      console.log('[v0] Loading user profile for user ID:', userId)

      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[v0] Error loading profile:', error.message)
        return
      }

      if (data) {
        console.log('[v0] Profile loaded successfully:', data)
        
        // Update form data with loaded profile
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email
        }))

        // Update health data with loaded profile
        setHealthData({
          age: data.age?.toString() || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          healthIssues: data.health_issues?.join(', ') || ""
        })

        if (data.target_weight) {
          setTargetWeight(data.target_weight)
          console.log('[v0] Target weight loaded:', data.target_weight)
        }

        console.log('[v0] User data populated in state')
      }
    } catch (err) {
      console.error('[v0] Unexpected error loading profile:', err)
    }
  }

  const loadStreakData = async (userId: string, client?: any) => {
    const supabaseClient = client || supabase
    if (!supabaseClient) {
      console.log('[v0] Cannot load streak data - Supabase client not initialized')
      return
    }
    
    try {
      console.log('[v0] Loading streak data for user:', userId)
      
      const streak = await getCurrentStreak(supabaseClient, userId)
      const dates = await getLoginDates(supabaseClient, userId)
      
      console.log('[v0] Streak loaded from database:', streak)
      console.log('[v0] Login dates loaded:', dates)
      
      setStreakData(streak)
      setLoginDates(dates)
      
      // No need to call loadUserBadges here as it might be redundant if already called
      // await loadUserBadges(userId) 
    } catch (err) {
      console.error('[v0] Error loading streak data:', err)
    }
  }

  const loadCompletedGoals = async (userId: string, client?: any) => {
    const supabaseClient = client || supabase
    
    if (!supabaseClient) {
      console.log('[v0] Cannot load completed goals - Supabase client not initialized')
      return
    }

    const { data, error } = await supabaseClient
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })

    if (error) {
      console.log('[v0] Error loading completed goals:', error)
      return
    }

    setCompletedGoals(data || [])
    console.log('[v0] Loaded completed goals:', data?.length || 0)
  }

  const loadUserBadges = async (userId: string, client?: any) => {
    const supabaseClient = client || supabase
    
    if (!supabaseClient) {
      console.log('[v0] Cannot load badges - Supabase client not initialized')
      return
    }

    try {
      console.log('[v0] Loading user badges...')
      const { data, error } = await supabaseClient
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
      
      if (error) {
        console.log('[v0] Error loading badges:', error)
        return
      }
      
      console.log('[v0] Badges loaded:', data)
      setUserBadges(data || [])
    } catch (err) {
      console.log('[v0] Error loading badges:', err)
    }
  }

  const handleLogout = async () => {
    if (!supabase) {
      console.error('[v0] Cannot logout - Supabase client not initialized')
      return
    }

    try {
      console.log('[v0] Logging out user...')
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[v0] Logout error:', error.message)
        alert(`Error al cerrar sesión: ${error.message}`)
        return
      }

      console.log('[v0] Logout successful')
      
      // Clear all user data
      setCurrentUser(null)
      setIsLoggedIn(false)
      setFormData({
        name: "",
        email: "",
        password: "",
      })
      setHealthData({
        age: "",
        weight: "",
        height: "",
        healthIssues: "",
      })
      setCompletedRecipes([])
      setCompletedRecipeDetails([]) // Clear completed recipe details
      setUploadedPhoto(null)
      // Clear streak data on logout
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        shouldAwardBadge: false
      })
      setLoginDates([])
      setUserBadges([])
      // Clear target weight on logout
      setTargetWeight(null)
      // Clear completed goals on logout
      setCompletedGoals([])
      // Reset BMI results on logout
      setBmiResult(null)
      setShowSaveGoalButton(false)
      setShowAchievementButton(false) // Clear achievement button state

      // Redirect to welcome screen
      setCurrentScreen("welcome")
      alert("Sesión cerrada exitosamente")
    } catch (err) {
      console.error('[v0] Unexpected logout error:', err)
      alert(`Error inesperado: ${err}`)
    }
  }

  const handleGoToRecipes = () => {
    setCurrentScreen("recipes")
  }

  const handleRegisterNow = () => {
    setCurrentScreen("form")
  }

  const handleViewRecipe = (recipeId: number) => {
    setSelectedRecipeId(recipeId)
    setUploadedPhoto(null)
    setCurrentScreen("recipeDetail")
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompleteRecipe = async () => {
    if (!selectedRecipeId || completedRecipes.includes(selectedRecipeId)) {
      return
    }

    if (!currentUser) {
      alert('Debes iniciar sesión para completar recetas')
      return
    }

    if (!supabase) {
      console.log('[v0] Cannot save recipe completion - Supabase client not initialized')
      return
    }

    // Save to database
    const { data, error } = await supabase
      .from('recipe_completions')
      .insert({
        user_id: currentUser.id, // Use currentUser.id
        recipe_id: selectedRecipeId,
        photo_url: uploadedPhoto,
        completed_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.log('[v0] Error saving recipe completion:', error)
      alert('Error al guardar la receta completada. Por favor intenta de nuevo.')
      return
    }

    // Update local state
    setCompletedRecipes([...completedRecipes, selectedRecipeId])
    // Re-fetch completed recipes to get updated details
    if (currentUser && currentUser.id) {
      await loadCompletedRecipes(currentUser.id, supabase);
    }
    alert('¡Receta completada! Mira tu lista de logros')
    
    // Navigate back to recipes list
    setCurrentScreen('recipes')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Health form input handler
  const handleHealthInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHealthData({
      ...healthData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBmiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBmiData({
      ...bmiData,
      [e.target.name]: e.target.value,
    })
    setBmiResult(null)
    setShowSaveGoalButton(false)
    setShowAchievementButton(false) // Clear achievement button state on input change
  }

  const handleCalculateBmi = (e: React.FormEvent) => {
    e.preventDefault()
    
    const weight = parseFloat(bmiData.weight)
    const height = parseFloat(bmiData.height) // Assuming height is already in meters
    
    if (!weight || !height || weight <= 0 || height <= 0) {
      alert("Por favor ingresa valores válidos para peso y estatura.")
      return
    }
    
    // Calculate BMI
    const bmi = weight / (height * height)
    
    // Determine category
    let category = ""
    if (bmi < 18.5) {
      category = "Bajo peso"
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Peso normal"
    } else if (bmi >= 25 && bmi < 30) {
      category = "Sobrepeso"
    } else {
      category = "Obesidad"
    }
    
    // Calculate ideal weight range (BMI 18.5 to 24.9)
    const minIdealWeight = 18.5 * (height * height)
    const maxIdealWeight = 24.9 * (height * height)
    
    // Update health data with calculated weight and height if they were entered for BMI
    // This is useful if the user calculated BMI first and then wants to save their profile
    setHealthData(prev => ({
      ...prev,
      weight: weight.toString(),
      height: (height * 100).toString() // Store height in cm in healthData
    }))
    
    setBmiResult({
      value: parseFloat(bmi.toFixed(1)),
      category,
      idealWeightRange: {
        min: parseFloat(minIdealWeight.toFixed(1)),
        max: parseFloat(maxIdealWeight.toFixed(1))
      }
    })
    
    if (targetWeight && currentUser) {
      const weightDifference = Math.abs(weight - targetWeight)
      if (weightDifference <= 2) {
        // Goal achieved! Redirect to achievements screen
        alert('¡Felicidades! Has alcanzado tu meta de peso. Ve a la sección de logros para guardarlo.')
        setCurrentScreen('achievements')
        setShowSaveGoalButton(false)
        setShowAchievementButton(false)
      } else {
        // Goal not yet achieved, show normal save button
        setShowSaveGoalButton(true)
        setShowAchievementButton(false)
      }
    } else {
      // No goal set, show save button
      setShowSaveGoalButton(true)
      setShowAchievementButton(false)
    }

    console.log("[v0] BMI calculated:", bmi, category, "Current weight:", weight, "Target:", targetWeight)
  }

  const handleSaveIdealWeightGoal = async () => {
    if (!bmiResult || !currentUser || !supabase) return
    
    const idealWeight = bmiResult.idealWeightRange.max
    
    try {
      console.log("[v0] Saving ideal weight goal:", idealWeight)
      
      // Update user profile with target_weight
      const { error } = await supabase
        .from('user_profiles')
        .update({ target_weight: idealWeight })
        .eq('id', currentUser.id)
      
      if (error) {
        console.error("[v0] Error saving goal:", error)
        alert(`Error al guardar meta: ${error.message}`)
        return
      }
      
      setTargetWeight(idealWeight)
      
      console.log("[v0] Ideal weight goal saved successfully")
      alert(`¡Meta guardada! Peso ideal: ${idealWeight.toFixed(1)} kg`)
      setShowSaveGoalButton(false)
      // Also check if the newly set goal is already met by current weight
      if (healthData.weight && Math.abs(parseFloat(healthData.weight) - idealWeight) <= 2) {
        setShowAchievementButton(true)
      } else {
        setShowAchievementButton(false)
      }
    } catch (err) {
      console.error("[v0] Unexpected error saving goal:", err)
      alert(`Error inesperado: ${err}`)
    }
  }

  const handleSaveWeightGoalAsAchievement = async () => {
    if (!currentUser || !targetWeight || !supabase) return

    const currentWeight = parseFloat(healthData.weight || '0')
    
    try {
      console.log('[v0] Saving weight goal as achievement...')

      // Save achievement
      const { error: achievementError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: currentUser.id,
          achievement_name: `Meta de Peso Alcanzada: ${targetWeight.toFixed(1)} kg`,
          achievement_type: 'goal_completed',
          description: `Alcanzaste tu meta de peso de ${targetWeight.toFixed(1)} kg. Peso actual: ${currentWeight.toFixed(1)} kg`,
          metadata: {
            target_weight: targetWeight,
            current_weight: currentWeight,
            date_completed: new Date().toISOString()
          },
          achieved_at: new Date().toISOString()
        })

      if (achievementError) {
        console.log('[v0] Error saving achievement:', achievementError)
        alert(`Error al guardar logro: ${achievementError.message}`)
        return
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ target_weight: null })
        .eq('id', currentUser.id)

      if (updateError) {
        console.log('[v0] Error clearing target weight:', updateError)
      }

      // Clear local state
      setTargetWeight(null)
      setShowSaveGoalButton(false)
      setShowAchievementButton(false)

      // Reload data
      await loadCompletedGoals(currentUser.id)
      await loadUserBadges(currentUser.id)

      // Show success message
      alert('¡Se ha añadido un nuevo logro! Míralo en tu lista de logros')
      console.log('[v0] Weight goal achievement saved successfully and goal deleted')
    } catch (err) {
      console.log('[v0] Unexpected error saving achievement:', err)
      alert(`Error inesperado: ${err}`)
    }
  }

  const handleCompleteGoal = async () => {
    if (!currentUser || !targetWeight) return

    setIsCompletingGoal(true)
    try {
      const supabase = createClient() // Use createClient to ensure a fresh client

      // Check if user is within 2kg of target weight to allow completion
      const weightDiff = Math.abs(parseFloat(healthData.weight || '0') - targetWeight)
      
      if (weightDiff > 2) {
        console.log('[v0] User is not close enough to target weight to complete goal')
        setShowGoalCompleteModal(false)
        setIsCompletingGoal(false)
        return
      }

      // Award achievement for completing weight goal
      const { error: achievementError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: currentUser.id,
          achievement_name: '¡Meta de Peso Alcanzada!',
          achievement_type: 'weight_goal',
          description: `Alcanzaste tu peso objetivo de ${targetWeight.toFixed(1)} kg`,
          metadata: {
            target_weight: targetWeight,
            actual_weight: healthData.weight,
            completed_at: new Date().toISOString()
          },
          achieved_at: new Date().toISOString() // Ensure achieved_at is set
        })

      if (achievementError) {
        console.log('[v0] Error creating achievement:', achievementError)
        alert(`Error al crear logro: ${achievementError.message}`)
        setIsCompletingGoal(false)
        return
      }

      // Clear target weight from profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ target_weight: null })
        .eq('id', currentUser.id)

      if (updateError) {
        console.log('[v0] Error clearing target weight:', updateError)
        alert(`Error al actualizar perfil: ${updateError.message}`)
        setIsCompletingGoal(false)
        return
      }

      // Update local state
      setTargetWeight(null)
      setShowGoalCompleteModal(false)
      setShowSaveGoalButton(false) // Hide save goal button
      setShowAchievementButton(false) // Hide achievement button
      
      // Reload badges to show new achievement
      await loadUserBadges(currentUser.id)
      await loadCompletedGoals(currentUser.id) // Reload completed goals

      console.log('[v0] Goal marked as completed successfully!')
      alert("¡Meta completada y guardada como logro! ¡Felicidades!")
    } catch (error) {
      console.log('[v0] Error completing goal:', error)
      alert(`Error al completar meta: ${error}`)
    } finally {
      setIsCompletingGoal(false)
    }
  }

  const handleDeleteCompletedGoal = async (goalId: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('id', goalId)

      if (error) {
        console.log('[v0] Error deleting goal:', error)
        alert(`Error al eliminar: ${error.message}`)
        return
      }

      // Reload completed goals
      if (currentUser) {
        await loadCompletedGoals(currentUser.id)
      }

      setShowDeleteGoalModal(false)
      setGoalToDelete(null)
      alert('Logro eliminado correctamente')
      console.log('[v0] Goal deleted successfully')
    } catch (err) {
      console.log('[v0] Unexpected error deleting goal:', err)
      alert('Error inesperado al eliminar logro')
    }
  }

  const handleDeleteActiveGoal = async () => {
    if (!currentUser || !supabase) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ target_weight: null })
        .eq('id', currentUser.id)

      if (error) {
        console.log('[v0] Error deleting active goal:', error)
        alert(`Error al eliminar meta: ${error.message}`)
        return
      }

      setTargetWeight(null)
      setShowDeleteGoalModal(false)
      setGoalToDelete(null)
      setShowSaveGoalButton(false) // Ensure buttons are reset
      setShowAchievementButton(false) // Ensure buttons are reset
      alert('Meta activa eliminada correctamente')
      console.log('[v0] Active goal deleted successfully')
    } catch (err) {
      console.log('[v0] Unexpected error:', err)
      alert('Error inesperado al eliminar meta activa')
    }
  }

  // Dummy function for streak update, replace with actual implementation if needed
  const updateLoginStreak = async (userId: string) => {
    if (!supabase) return
    try {
      console.log('[v0] Updating login streak...')
      const streak = await recordLoginAndCalculateStreak(supabase, userId)
      setStreakData(streak)
      const dates = await getLoginDates(supabase, userId)
      setLoginDates(dates)
      console.log('[v0] Streak data updated after login:', streak)
    } catch (error) {
      console.error('[v0] Error updating login streak:', error)
    }
  }


  const handleSubmit = async (e: React.FormEvent, mode: "login" | "register") => {
    e.preventDefault()
    
    if (!supabase) {
      console.error("[v0] Cannot authenticate - Supabase client not initialized")
      alert("Error: Database connection not configured. Please add environment variables in the Vars section.")
      return
    }
    
    console.log("[v0] Starting", mode, "process...")

    try {
      if (mode === "register") {
        console.log("[v0] Attempting Supabase registration...")
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name
            }
          }
        })

        console.log("[v0] Supabase registration response:", { data, error })

        if (error) {
          console.error("[v0] Registration error:", error.message)
          alert(`Registration error: ${error.message}`)
          return
        }

        if (data.user) {
          console.log("[v0] Registration successful! User ID:", data.user.id)
          setCurrentUser(data.user)
          setIsLoggedIn(true)
          setJustLoggedIn(true)
          alert("Registration successful! Please complete your health information.")
          setCurrentScreen("health")
        }
      } else { // mode === "login"
        console.log('[v0] Login attempt for:', formData.email)
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          console.log('[v0] Login error:', error)
          alert('Error al iniciar sesión: ' + error.message)
          return
        }

        if (data.user) {
          console.log('[v0] Login successful')
          setCurrentUser(data.user.id)
          setIsLoggedIn(true)

          await Promise.all([
            recordLoginAndCalculateStreak(supabase, data.user.id), // Pass supabase client
            loadUserProfile(data.user.id, supabase), // Pass supabase client
            loadUserBadges(data.user.id, supabase), // Pass supabase client
            loadCompletedGoals(data.user.id, supabase), // Pass supabase client
            loadStreakData(data.user.id, supabase), // Pass supabase client
            loadCompletedRecipes(data.user.id, supabase) // Add completed recipes loading
          ])

          setJustLoggedIn(true)
        }
      }
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      alert(`Unexpected error: ${err}`)
    }
  }

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      console.error("[v0] Cannot save profile - Supabase client not initialized")
      alert("Error: Database connection not configured. Please add environment variables in the Vars section.")
      return
    }
    
    console.log("[v0] Submitting health information...")
    console.log("[v0] Health data:", healthData)
    console.log("[v0] Current user:", currentUser)
    
    if (!currentUser) {
      console.error("[v0] No user data available")
      alert("Error: User session not found. Please try logging in again.")
      setCurrentScreen("form")
      setIsLoginMode(true)
      return
    }

    try {
      // Parse health data to appropriate types
      const ageNum = parseInt(healthData.age)
      const weightNum = parseFloat(healthData.weight)
      const heightNum = parseFloat(healthData.height)

      // Validate numeric values
      if (isNaN(ageNum) || ageNum <= 0 || isNaN(weightNum) || weightNum <= 0 || isNaN(heightNum) || heightNum <= 0) {
        alert("Por favor ingresa valores numéricos válidos para edad, peso y estatura.")
        return
      }

      const profileData = {
        id: currentUser.id, // Required for upsert to know which row to match
        name: formData.name, // Make sure name is also saved
        email: formData.email, // Make sure email is also saved
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        health_issues: healthData.healthIssues ? healthData.healthIssues.split(',').map(issue => issue.trim()).filter(Boolean) : [],
        account_created: new Date().toISOString() // Consider if this should be set only on initial registration
      }

      console.log("[v0] Upserting profile for user ID:", currentUser.id)
      console.log("[v0] Profile data:", profileData)

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'id', // Match on the id column
          ignoreDuplicates: false // Update if exists
        })
        .select()

      console.log("[v0] Profile upsert response:", { data, error })

      if (error) {
        console.error("[v0] Error saving profile:", error.message)
        alert(`Error saving profile: ${error.message}\n\nPlease make sure:\n1. You disabled email confirmation in Supabase\n2. Your user is authenticated\n3. The table structure is correct`)
        return
      }

      console.log("[v0] Profile saved successfully!")
      alert("Health profile saved!")
      setCurrentScreen("profile")
    } catch (err) {
      console.error("[v0] Unexpected error saving profile:", err)
      alert(`Unexpected error: ${err}`)
    }
  }

  const handleAchievements = () => {
    setCurrentScreen("achievements")
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
  }

  const handleGoToBmi = () => {
    if (!isLoggedIn) {
      setShowRegisterModal(true)
    } else {
      setCurrentScreen("bmi")
    }
  }

  const handleRegisterFromModal = () => {
    setShowRegisterModal(false)
    setCurrentScreen("form")
    setIsLoginMode(false) // Ensure it's in register mode
  }

  const getCompletedDaysArray = () => {
    // Convert login dates to day numbers (1-31)
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return loginDates
      .filter(dateStr => {
        const date = new Date(dateStr)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .map(dateStr => new Date(dateStr).getDate())
  }
  
  const completedDays = getCompletedDaysArray()

  return (
    <div className="min-h-screen bg-background">
      {supabaseError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 text-center text-sm">
          <strong>Database Not Connected:</strong> Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vars section (left sidebar)
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Modal Header */}
            <div className="from-primary/10 to-primary/5 px-8 py-8 text-center border-b border-border/50">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Lock className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 text-balance">¿Quieres usar el IMC?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Regístrate para esto y desbloquear todas las otras funcionalidades para mejorar tu alimentación y salud!
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-8">
              <button
                onClick={handleRegisterFromModal}
                className="w-full px-6 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <User className="w-6 h-6" />
                Regístrate aquí
                <ArrowRight className="w-6 h-6" />
              </button>

              <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
                Únete a nuestra comunidad y accede a todas las funcionalidades de salud y nutrición
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && currentScreen !== "welcome" && currentScreen !== "form" && currentScreen !== "health" && (
        <button
          onClick={() => setCurrentScreen("profile")}
          className="fixed top-4 right-4 z-50 w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center group"
          title="Go to Profile"
        >
          <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Welcome Screen - Shows initially */}
      {currentScreen === "welcome" && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-in fade-in duration-700">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground leading-tight text-balance">Bienvenido a Nexo!</h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Tu ruta para un mejor estilo de vida nutricional.
              </p>
            </div>

            <button
              onClick={handleGoToRecipes}
              className="group w-full max-w-sm mx-auto px-8 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              Ir a las recetas
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Decorative Element */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground">Descubre deliciosas recetas saludables.</p>
            </div>
          </div>
        </div>
      )}

      {currentScreen === "recipes" && (
        <div className="min-h-screen px-4 py-8 animate-in fade-in slide-in-from-right-6 duration-500">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isLoggedIn ? "Tus recetas saludables" : "Lista de recetas"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoggedIn ? "Todas las recetas disponibles personalizadas para ti" : "Encuentra tu receta preferida!"}
              </p>
              
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    setCurrentScreen("form")
                    setIsLoginMode(true)
                  }}
                  className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </button>
              )}
            </div>

            {recipesLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Cargando recetas...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-semibold text-foreground mb-2">No hay recetas disponibles</p>
                <p className="text-xs text-muted-foreground">
                  Por favor, ejecuta el script de SQL para agregar recetas a la base de datos
                </p>
              </div>
            ) : (
              <>
                {/* Recipe Cards */}
                <div className="space-y-4 mb-8">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleViewRecipe(recipe.id)}
                      className="w-full text-left bg-card rounded-2xl shadow-md overflow-hidden border border-border/50 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
                    >
                      <img
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-foreground">{recipe.name}</h3>
                          {completedRecipes.includes(recipe.id) && <CheckCircle2 className="w-6 h-6 text-primary " />}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{recipe.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* BMI Calculator Section */}
            <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl p-8 text-center border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Calculator className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3 text-balance">
                ¿Quieres calcular tu Índice de Masa Corporal?
              </h2>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto text-pretty">
                Conoce tu IMC y da el primer paso hacia tus objetivos de salud
              </p>

              <button
                onClick={handleGoToBmi}
                className="group px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center justify-center gap-3"
              >
                <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                ¡Haz clic aquí para calcular y alcanzar tus metas de salud!
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 pt-6 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">
                  El IMC es una herramienta útil para evaluar tu peso en relación con tu altura
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setCurrentScreen("welcome")}
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Volver a la pagina de inicio
            </button>
          </div>
        </div>
      )}

      {currentScreen === "recipeDetail" && selectedRecipeId && (
        <div className="min-h-screen px-4 py-8 animate-in fade-in slide-in-from-right-6 duration-500">
          <div className="max-w-2xl mx-auto">
            {(() => {
              const recipe = recipes.find((r) => r.id === selectedRecipeId)
              if (!recipe) return null
              const isCompleted = completedRecipes.includes(recipe.id)

              return (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setCurrentScreen("recipes")}
                    className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Volver a las recetas</span>
                  </button>

                  {/* Recipe Header */}
                  <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
                    <img
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h1 className="text-2xl font-bold text-foreground text-balance">{recipe.name}</h1>
                        {isCompleted && (
                          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full ">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span className="text-xs font-bold text-primary">Completada</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{recipe.description}</p>
                    </div>
                  </div>

                  {/* Ingredients Section */}
                  <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
                    <div className=" from-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
                      <h2 className="text-lg font-bold text-foreground">Ingredientes</h2>
                    </div>
                    <div className="px-6 py-5">
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 "></div>
                            <span className="text-sm text-foreground leading-relaxed">{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Preparation Steps Section */}
                  <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
                    <div className=" from-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
                      <h2 className="text-lg font-bold text-foreground">Paso a paso de la receta</h2>
                    </div>
                    <div className="px-6 py-5">
                      <ol className="space-y-4">
                        {recipe.steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center ">
                              <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                            </div>
                            <span className="text-sm text-foreground leading-relaxed pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Completion Section */}
                  {!isCompleted && (
                    <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
                      <div className=" from-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
                        <h2 className="text-lg font-bold text-foreground">Marca para completar la receta</h2>
                        <p className="text-xs text-muted-foreground mt-1">Sube una foto como prueba que completaste tu receta</p>
                      </div>
                      <div className="px-6 py-6">
                        {/* Photo Upload */}
                        <div className="mb-6">
                          <label htmlFor="recipePhoto" className="block w-full cursor-pointer">
                            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                              {uploadedPhoto ? (
                                <div className="space-y-3">
                                  <img
                                    src={uploadedPhoto || "/placeholder.svg"}
                                    alt="Uploaded recipe"
                                    className="w-full h-48 object-cover rounded-xl mx-auto"
                                  />
                                  <p className="text-sm font-semibold text-primary">¡Foto subida exitosamente!</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Upload className="w-8 h-8 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground mb-1">Subir Foto</p>
                                    <p className="text-xs text-muted-foreground">
                                      Presione para seleccionar una foto de su dispositivo
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </label>
                          <input
                            type="file"
                            id="recipePhoto"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>

                        {/* Complete Button */}
                        <button
                          onClick={handleCompleteRecipe}
                          disabled={!uploadedPhoto}
                          className="w-full px-6 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          Completar Receta
                        </button>
                        {!uploadedPhoto && (
                          <p className="text-xs text-muted-foreground text-center mt-3">
                            Por favor suba una imagen para poder marcar la receta como completada.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {isCompleted && uploadedPhoto && (
                    <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
                      <div className=" from-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          Receta Completada!
                        </h2>
                      </div>
                      <div className="px-6 py-6">
                        <img
                          src={uploadedPhoto || "/placeholder.svg"}
                          alt="Your completed recipe"
                          className="w-full h-64 object-cover rounded-xl mb-4"
                        />
                        <p className="text-sm text-muted-foreground text-center leading-relaxed">
                          ¡Buen Hecho! Esta receta fue añadida a tus logros.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}

      {currentScreen === "form" && (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Form Container */}
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50">
              {/* Header */}
              <div className=" from-primary/10 to-primary/5 px-6 py-8 text-center border-b border-border/50">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {isLoginMode ? "Bienvenido de vuelta" : "Registrate a Nexo"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLoginMode ? "Inicia sesión para ver tus recetas" : "Crea una cuenta para empezar"}
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-8">
                <form onSubmit={(e) => handleSubmit(e, isLoginMode ? "login" : "register")} className="space-y-5">
                  {/* Name Field - Only for Registration */}
                  {!isLoginMode && (
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-foreground block">
                        Nombre Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ingrese su nombre"
                          required={!isLoginMode}
                          className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground block">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ingrese su correo"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-foreground block">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Ingresar su contraseña"
                        required
                        className="w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 mt-6"
                  >
                    {isLoginMode ? "Iniciar sesión" : "Registrar"}
                  </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLoginMode ? "¿No tiene una cuenta?" : "¿Ya tiene una cuenta?"}{" "}
                    <button onClick={toggleMode} className="text-primary font-semibold hover:underline transition-all">
                      {isLoginMode ? "Registrarse aqui" : "Inicie sesión aqui"}
                    </button>
                  </p>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Para continuar acepte los terminos y condiciones.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen("recipes")}
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Volver a la lista de recetas
            </button>
          </div>
        </div>
      )}

      {/* Health Information Form Screen */}
      {currentScreen === "health" && (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Form Container */}
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50">
              {/* Header */}
              <div className=" from-primary/10 to-primary/5 px-6 py-8 text-center border-b border-border/50">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Tu perfil de salud</h2>
                <p className="text-sm text-muted-foreground">Ayudanos a personalizar tus recetas</p>
              </div>

              {/* Form */}
              <div className="px-6 py-8">
                <form onSubmit={handleHealthSubmit} className="space-y-5">
                  {/* Age Field */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="text-sm font-semibold text-foreground block">
                      Edad
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={healthData.age}
                        onChange={handleHealthInputChange}
                        placeholder="Ingrese su edad"
                        min="1"
                        max="120"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Weight Field */}
                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-semibold text-foreground block">
                      Peso (kg)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={healthData.weight}
                        onChange={handleHealthInputChange}
                        placeholder="Ingrese su peso en kilos (kg)"
                        min="1"
                        step="0.1"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Height Field */}
                  <div className="space-y-2">
                    <label htmlFor="height" className="text-sm font-semibold text-foreground block">
                      Estatura (cm)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={healthData.height}
                        onChange={handleHealthInputChange}
                        placeholder="Ingrese su estatura en cm"
                        min="1"
                        step="0.1"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Health Issues Field */}
                  <div className="space-y-2">
                    <label htmlFor="healthIssues" className="text-sm font-semibold text-foreground block">
                      Problemas de salud (Opcional)
                    </label>
                    <textarea
                      id="healthIssues"
                      name="healthIssues"
                      value={healthData.healthIssues}
                      onChange={handleHealthInputChange}
                      placeholder="Dinos su problemas de salud (e.g., diabetes, hipertensión, alergias, etc)"
                      rows={4}
                      className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Esto nos ayuda para personalizar sus recetas.</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 mt-6"
                  >
                    Continuar
                  </button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">Tu información es privada y segura.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen("form")}
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Volver al registro
            </button>
          </div>
        </div>
      )}

      {currentScreen === "profile" && (
        <div className="min-h-screen px-4 py-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Mi Perfil</h1>
              <p className="text-sm text-muted-foreground">Bienvenido!, {formData.name}!</p>
            </div>

            {/* Profile Card */}
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
              <div className=" from-primary/10 to-primary/5 px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Información del usuario.</h2>
                <button
                  onClick={() => setCurrentScreen("editProfile")}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Edit className="w-4 h-4" />
                  Editar Información
                </button>
              </div>

              <div className="px-6 py-6 space-y-5">
                {/* Name */}
                <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Nombre</p>
                    <p className="text-base font-semibold text-foreground">{formData.name || "No Registrado"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Correo Electrónico
                    </p>
                    <p className="text-base font-semibold text-foreground break-all">
                      {formData.email || "No Registrado"}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Edad</p>
                    <p className="text-base font-semibold text-foreground">{healthData.age || "No especificado"} {healthData.age && "años"}</p>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Peso</p>
                    <p className="text-base font-semibold text-foreground">{healthData.weight || "No especificado"} {healthData.weight && "kg"}</p>
                  </div>
                </div>

                {/* Height */}
                <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Estatura</p>
                    <p className="text-base font-semibold text-foreground">{healthData.height || "No especificado"} {healthData.height && "cm"}</p>
                  </div>
                </div>

                {/* Health Issues */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Problemas de salud
                    </p>
                    <p className="text-base font-semibold text-foreground leading-relaxed">
                      {healthData.healthIssues || "No especificados"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {targetWeight && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl shadow-xl overflow-hidden border border-emerald-500/30 mb-6">
                <div className="px-6 py-5 border-b border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Metas de Salud</h2>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Peso Objetivo
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {targetWeight.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Diferencia
                      </p>
                      {healthData.weight && (
                        <p className={`text-xl font-bold ${
                          parseFloat(healthData.weight) > targetWeight 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : parseFloat(healthData.weight) < targetWeight
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {parseFloat(healthData.weight) > targetWeight && '+'}
                          {(parseFloat(healthData.weight) - targetWeight).toFixed(1)} kg
                        </p>
                      )}
                    </div>
                  </div>

                  {healthData.weight && parseFloat(healthData.weight) !== targetWeight && (
                    <div className="mt-4 p-4 bg-background/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        {parseFloat(healthData.weight) > targetWeight 
                          ? `Te faltan ${(parseFloat(healthData.weight) - targetWeight).toFixed(1)} kg para alcanzar tu meta.`
                          : `Necesitas ganar ${(targetWeight - parseFloat(healthData.weight)).toFixed(1)} kg para alcanzar tu meta.`
                        }
                      </p>
                    </div>
                  )}

                  {healthData.weight && parseFloat(healthData.weight) === targetWeight && (
                    <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        ¡Felicitaciones! Has alcanzado tu peso objetivo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements Button */}
            <button
              onClick={handleAchievements}
              className="w-full px-6 py-5 bg-linear-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              <Award className="w-6 h-6" />
              Mira tus logros!
            </button>

            {/* Additional Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setCurrentScreen("recipes")}
                className="w-full px-6 py-4 bg-card border border-border rounded-xl font-semibold text-foreground hover:bg-accent transition-all"
              >
                Lista de Recetas
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-xl font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tu perfil ya esta completado! Empieza a explorar las recetas basadas en tu salud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Screen */}
      {currentScreen === "achievements" && (
        <div className="min-h-screen px-4 py-8 animate-in fade-in slide-in-from-right-6 duration-500">
          <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Tus Logros</h1>
              <p className="text-sm text-muted-foreground">Sigue tu progreso y celebra tus logros.</p>
            </div>

            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
              <div className="from-emerald-500/10 to-teal-500/10 px-6 py-5 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Objetivos de Salud
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Gestiona y celebra tus objetivos de salud logrados
                </p>
              </div>

              <div className="px-6 py-6">
                {/* Active Goal Section */}
                {targetWeight && (
                  <div className="mb-6 pb-6 border-b border-border/30">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Meta Activa
                    </h3>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-5 border-2 border-emerald-500/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-base font-bold text-foreground mb-2">
                            Peso objetivo: {targetWeight.toFixed(1)} kg
                          </p>
                          <p className="text-sm text-muted-foreground mb-3">
                            Peso actual: {healthData.weight ? parseFloat(healthData.weight).toFixed(1) : '0.0'} kg
                          </p>
                          
                          {healthData.weight && Math.abs(parseFloat(healthData.weight) - targetWeight) <= 2 && (
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500/50 rounded-xl p-4 mb-3">
                              <div className="flex items-start gap-3">
                                <Award className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-1">
                                    ¡Perfecto! Has alcanzado o superado tu meta
                                  </p>
                                  <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                                    Estás en tu peso objetivo. ¡Felicidades por tu logro!
                                  </p>
                                  <button
                                    onClick={handleSaveWeightGoalAsAchievement}
                                    className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                                  >
                                    <Check className="w-4 h-4" />
                                    Guardar como Logro Completado
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Progress info if not achieved */}
                          {healthData.weight && Math.abs(parseFloat(healthData.weight) - targetWeight) > 2 && (
                            <div className="text-xs text-muted-foreground">
                              Te faltan {Math.abs(parseFloat(healthData.weight) - targetWeight).toFixed(1)} kg para alcanzar tu meta
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => {
                            setGoalToDelete('active')
                            setShowDeleteGoalModal(true)
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Eliminar meta"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Active Goal */}
                {!targetWeight && (
                  <div className="mb-6 pb-6 border-b border-border/30">
                    <div className="text-center py-6">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-2">No tienes una meta activa</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Calcula tu IMC y establece una meta de peso
                      </p>
                      <button
                        onClick={() => setCurrentScreen('bmi')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                        <Calculator className="w-4 h-4" />
                        Calcular IMC
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed Goals Section */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Logros Completados
                  </h3>
                  
                  {completedGoals.length > 0 ? (
                    <div className="space-y-3">
                      {completedGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground mb-1">
                                {goal.achievement_name}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {goal.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Activity className="w-3 h-3" />
                                <span>
                                  {new Date(goal.achieved_at).toLocaleDateString('es-CL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-accent/50 rounded-2xl">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">Aún no has completado objetivos</p>
                      <p className="text-xs text-muted-foreground">
                        Alcanza tus metas de peso para acumular logros
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Login Streak Section */}
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-border/50 mb-6">
              <div className=" from-primary/10 to-primary/5 px-6 py-5 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Racha de inicio sesión (Santiago, Chile)
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Inicia sesión todos los días después de medianoche (00:00 hora de Santiago) para mejorar tu racha!
                </p>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-center justify-center gap-8 mb-6 pb-6 border-b border-border/30">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{streakData.currentStreak}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                      Racha Actual
                    </p>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{streakData.longestStreak}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                      Racha Más Larga
                    </p>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary/70">{31 - streakData.currentStreak}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                      Días Hasta Reset
                    </p>
                  </div>
                </div>

                {/* Days Grid - Shows current cycle (1-31) */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground mb-3 text-center">
                    Progreso del Ciclo (Día {streakData.currentStreak} de 31)
                  </p>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isCompleted = day <= streakData.currentStreak
                    const isToday = day === streakData.currentStreak
                    return (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                            transition-all duration-300 cursor-pointer relative
                            ${
                              isCompleted
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                                : "bg-accent border-2 border-border text-muted-foreground hover:border-primary/50"
                            }
                            ${isToday ? "ring-4 ring-primary/50 ring-offset-2" : ""}
                          `}
                          title={`Día ${day}${isCompleted ? " - Completado" : ""}${isToday ? " - Hoy" : ""}`}
                        >
                          {day}
                          {isToday && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse"></div>
                          )}
                        </div>
                        {isCompleted && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                      </div>
                    )
                  })}
                </div>

                {/* Progress Bar */}
                <div className="mt-6 pt-6 border-t border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">Progreso del Ciclo Actual</p>
                    <p className="text-sm font-bold text-primary">{Math.round((streakData.currentStreak / 31) * 100)}%</p>
                  </div>
                  <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                      style={{ width: `${(streakData.currentStreak / 31) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {streakData.currentStreak === 31 
                      ? "¡Ciclo completo! Tu racha se reiniciará en el próximo inicio de sesión." 
                      : `¡Sigue así! ${31 - streakData.currentStreak} días más para completar el ciclo.`}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-border/30">
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Sobre tu Racha
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li>• Los días se cuentan según la hora de Santiago, Chile (UTC-3/UTC-4)</li>
                      <li>• Debes iniciar sesión todos los días después de medianoche (00:00) para contar un nuevo día</li>
                      <li>• Si faltas un día, tu racha se reinicia a 1</li>
                      <li>• Al alcanzar 31 días, recibes una insignia y tu racha se reinicia a 1</li>
                      <li>• Tu racha más larga siempre se guarda</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-primary" />
                Recetas Completadas
              </h3>
              
              {completedRecipeDetails.length > 0 ? (
                <div className="space-y-3">
                  {completedRecipeDetails.map((completion) => {
                    // Find the matching local recipe to get the image
                    const localRecipe = recipes.find(r => r.id === completion.recipe_id)
                    
                    return (
                      <div
                        key={completion.id}
                        className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-4 border border-primary/20 hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {/* Recipe Photo - using local image */}
                          {localRecipe?.image && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                              <img
                                src={localRecipe.image || "/placeholder.svg"}
                                alt={completion.recipes?.title || localRecipe.name || 'Receta'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Recipe Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-foreground mb-1">
                              {completion.recipes?.title || localRecipe?.name || 'Receta sin título'}
                            </h4>
                            {completion.notes && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {completion.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-primary" />
                              <span>
                                Completada el {new Date(completion.completed_at).toLocaleDateString('es-CL', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-accent/50 rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ChefHat className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Aún no has completado recetas</p>
                  <p className="text-xs text-muted-foreground">
                    Completa tu primera receta para verla aquí
                  </p>
                </div>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={() => setCurrentScreen("profile")}
              className="w-full px-6 py-4 bg-card border border-border rounded-xl font-semibold text-foreground hover:bg-accent transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver al perfil
            </button>

            {/* Motivational Message */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                ¡Inicia sesión todos los días para mejorar tu racha y tu salud!
              </p>
            </div>
          </div>
        </div>
      )}

      {currentScreen === "bmi" && (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* BMI Form Container */}
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50">
              {/* Header */}
              <div className="from-primary/10 to-primary/5 px-6 py-8 text-center border-b border-border/50">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Calcula tu Índice de Masa Corporal (IMC)</h2>
                <p className="text-sm text-muted-foreground">Ingresa tu peso y estatura para calcular tu IMC</p>
              </div>

              {/* BMI Information */}
              <div className="px-6 py-5 bg-primary/5 border-b border-border/50">
                <h3 className="text-sm font-bold text-foreground mb-2">¿Qué es el IMC?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El Índice de Masa Corporal (IMC) es una medida utilizada para evaluar si una persona tiene un peso
                  saludable en relación con su estatura. Es una herramienta importante para entender tu salud general y
                  establecer metas realistas de bienestar.
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-8">
                <form onSubmit={handleCalculateBmi} className="space-y-5">
                  {/* Weight Field */}
                  <div className="space-y-2">
                    <label htmlFor="bmiWeight" className="text-sm font-semibold text-foreground block">
                      Peso
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          id="bmiWeight"
                          name="weight"
                          value={bmiData.weight}
                          onChange={handleBmiInputChange}
                          placeholder="67"
                          min="1"
                          step="0.1"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="flex items-center px-4 py-3.5 bg-accent border border-border rounded-xl">
                        <span className="text-sm font-semibold text-foreground">kg</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Ejemplo: 67</p>
                  </div>

                  {/* Height Field */}
                  <div className="space-y-2">
                    <label htmlFor="bmiHeight" className="text-sm font-semibold text-foreground block">
                      Estatura
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          id="bmiHeight"
                          name="height"
                          value={bmiData.height}
                          onChange={handleBmiInputChange}
                          placeholder="1.72"
                          min="0.01"
                          step="0.01"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="flex items-center px-4 py-3.5 bg-accent border border-border rounded-xl">
                        <span className="text-sm font-semibold text-foreground">m</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Ejemplo: 1.72 (en metros)</p>
                  </div>

                  {/* Calculate Button */}
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 mt-6 flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Calcular IMC
                  </button>
                </form>

                {/* BMI Result Display */}
                {bmiResult && (
                  <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/30">
                      <div className="text-center mb-4">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Tu IMC es
                        </p>
                        <p className="text-5xl font-bold text-primary mb-2">{bmiResult.value}</p>
                        <p className="text-base font-bold text-foreground">{bmiResult.category}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-primary/20">
                        <p className="text-sm font-semibold text-foreground mb-2">Rango de peso ideal:</p>
                        <p className="text-base text-muted-foreground">
                          {bmiResult.idealWeightRange.min.toFixed(1)} kg - {bmiResult.idealWeightRange.max.toFixed(1)} kg
                        </p>
                      </div>
                    </div>

                    {/* Save Goal Button */}
                    {showSaveGoalButton && (
                      <button
                        onClick={handleSaveIdealWeightGoal}
                        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        ¿Quieres guardar este peso ideal como meta?
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 pb-8">
                <div className="pt-6 border-t border-border/50">
                  <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wide">Categorías de IMC</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Bajo peso</span>
                      <span className="font-semibold text-foreground">Menor a 18.5</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Peso normal</span>
                      <span className="font-semibold text-foreground">18.5 - 24.9</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sobrepeso</span>
                      <span className="font-semibold text-foreground">25 - 29.9</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Obesidad</span>
                      <span className="font-semibold text-foreground">30 o mayor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setCurrentScreen("recipes")}
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a las recetas
            </button>
          </div>
        </div>
      )}

      {currentScreen === "editProfile" && (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Edit Form Container */}
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50">
              {/* Header */}
              <div className="from-primary/10 to-primary/5 px-6 py-8 text-center border-b border-border/50">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Edit className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Editar tu Perfil</h2>
                <p className="text-sm text-muted-foreground">Actualiza tu información personal y de salud</p>
              </div>

              {/* Form */}
              <div className="px-6 py-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    // This is a placeholder for the actual submission logic
                    // In a real app, you'd call handleHealthSubmit or a similar function here
                    console.log("Profile updated:", { ...formData, ...healthData })
                    // For now, just navigate back and show a success message
                    alert("Perfil actualizado exitosamente!")
                    setCurrentScreen("profile")
                  }}
                  className="space-y-5"
                >
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="editName" className="text-sm font-semibold text-foreground block">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        id="editName"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ingrese su nombre"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="editEmail" className="text-sm font-semibold text-foreground block">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        id="editEmail"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ingrese su correo"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="editPassword" className="text-sm font-semibold text-foreground block">
                      Nueva Contraseña (Opcional)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="editPassword"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Dejar en blanco para mantener actual"
                        className="w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Age Field */}
                  <div className="space-y-2">
                    <label htmlFor="editAge" className="text-sm font-semibold text-foreground block">
                      Edad
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        id="editAge"
                        name="age"
                        value={healthData.age}
                        onChange={handleHealthInputChange}
                        placeholder="Ingrese su edad"
                        min="1"
                        max="120"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Weight Field */}
                  <div className="space-y-2">
                    <label htmlFor="editWeight" className="text-sm font-semibold text-foreground block">
                      Peso (kg)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        id="editWeight"
                        name="weight"
                        value={healthData.weight}
                        onChange={handleHealthInputChange}
                        placeholder="Ingrese su peso en kilos (kg)"
                        min="1"
                        step="0.1"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Height Field */}
                  <div className="space-y-2">
                    <label htmlFor="editHeight" className="text-sm font-semibold text-foreground block">
                      Estatura (cm)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        id="editHeight"
                        name="height"
                        value={healthData.height}
                        onChange={handleHealthInputChange}
                        placeholder="Ingrese su estatura en cm"
                        min="1"
                        step="0.1"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Health Issues Field */}
                  <div className="space-y-2">
                    <label htmlFor="editHealthIssues" className="text-sm font-semibold text-foreground block">
                      Problemas de salud (Opcional)
                    </label>
                    <textarea
                      id="editHealthIssues"
                      name="healthIssues"
                      value={healthData.healthIssues}
                      onChange={handleHealthInputChange}
                      placeholder="Dinos su problemas de salud"
                      rows={4}
                      className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen("profile")}
                      className="flex-1 px-6 py-4 bg-accent border border-border rounded-xl font-semibold text-foreground hover:bg-accent/80 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tus cambios se guardarán de forma segura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGoalCompleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-border animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">¡Felicitaciones!</h3>
                  <p className="text-xs text-muted-foreground">Completar meta de peso</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-foreground leading-relaxed mb-6">
                ¿Estás seguro de que quieres marcar esta meta como completada? 
                Se agregará una insignia a tus logros y podrás establecer una nueva meta.
              </p>

              <div className="bg-emerald-500/10 rounded-xl p-4 mb-6 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Peso Objetivo</span>
                  <span className="text-sm font-bold text-emerald-600">{targetWeight?.toFixed(1)} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Peso Actual</span>
                  <span className="text-sm font-bold text-foreground">{healthData.weight} kg</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalCompleteModal(false)}
                  disabled={isCompletingGoal}
                  className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl font-semibold transition-all text-foreground disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompleteGoal}
                  disabled={isCompletingGoal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCompletingGoal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Completando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Completar Meta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteGoalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              {goalToDelete === 'active' 
                ? '¿Estás seguro de que quieres eliminar tu meta activa de peso? Esta acción no se puede deshacer.'
                : '¿Estás seguro de que quieres eliminar este logro completado? Esta acción no se puede deshacer.'
              }
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteGoalModal(false)
                  setGoalToDelete(null)
                }}
                className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (goalToDelete === 'active') {
                    handleDeleteActiveGoal()
                  } else if (goalToDelete) {
                    handleDeleteCompletedGoal(goalToDelete)
                  }
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
