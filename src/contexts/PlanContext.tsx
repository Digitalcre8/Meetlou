import * as React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { calculateNutritionTargets } from '@/services/nutritionService'
import {
  generateWeeklyPlan,
  getAlternatives,
  removeMealFromPlan,
  swapMealInPlan,
} from '@/services/mealPlanService'
import { buildShoppingList, forceCheaperBasket } from '@/services/basketOptimizationService'
import { PRODUCTS } from '@/data/seed/products'
import { interpretPlanChangeRequest } from '@/services/aiService'
import { applyPlanChange } from '@/services/planChangeService'
import { buildDemoProfile } from '@/data/seed/demoProfile'
import type {
  Meal,
  MealPlan,
  MealType,
  NutritionTargets,
  Product,
  ShoppingList,
  UserProfile,
  WeightEntry,
} from '@/types'

function startOfWeekISO(): string {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

interface PlanContextValue {
  profile: UserProfile | null
  targets: NutritionTargets | null
  plan: MealPlan | null
  shoppingList: ShoppingList | null
  weightEntries: WeightEntry[]
  loading: boolean
  generating: boolean
  saveProfileAndGenerate: (profile: UserProfile) => Promise<void>
  updateProfile: (partial: Partial<UserProfile>, opts?: { regenerate?: boolean }) => Promise<void>
  regeneratePlan: () => Promise<void>
  swapMeal: (slotId: string, newMealId: string) => Promise<void>
  removeMeal: (slotId: string) => Promise<void>
  getAlternativesFor: (type: MealType, currentMealId: string) => Meal[]
  submitChangeRequest: (text: string) => Promise<string>
  updateShoppingItemQuantity: (itemId: string, quantity: number) => Promise<void>
  addWeightEntry: (weightKg: number) => Promise<void>
  getProductById: (id: string) => Product | undefined
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user, dataStore, isDemo, loading: authLoading } = useAuth()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [targets, setTargets] = React.useState<NutritionTargets | null>(null)
  const [plan, setPlan] = React.useState<MealPlan | null>(null)
  const [shoppingList, setShoppingList] = React.useState<ShoppingList | null>(null)
  const [weightEntries, setWeightEntries] = React.useState<WeightEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [generating, setGenerating] = React.useState(false)

  const getProductById = React.useCallback((id: string) => PRODUCTS.find((p) => p.id === id), [])

  const regenerateShoppingList = React.useCallback(
    async (currentPlan: MealPlan, currentProfile: UserProfile) => {
      const list = buildShoppingList(currentPlan, currentProfile)
      await dataStore.saveShoppingList(list)
      setShoppingList(list)
      return list
    },
    [dataStore],
  )

  React.useEffect(() => {
    let active = true
    async function load() {
      // Wait for AuthContext to finish resolving the session before deciding
      // there's no user — otherwise a full page reload briefly reports
      // user === null (Supabase/local session check hasn't resolved yet),
      // which would wrongly clear the profile and bounce a signed-in user
      // to onboarding.
      if (authLoading) return

      if (!user) {
        setProfile(null)
        setTargets(null)
        setPlan(null)
        setShoppingList(null)
        setWeightEntries([])
        setLoading(false)
        return
      }
      setLoading(true)

      if (isDemo) {
        const existing = await dataStore.getProfile(user.id)
        if (!existing) {
          const demoProfile = buildDemoProfile(user.id)
          const demoTargets = calculateNutritionTargets(demoProfile)
          const demoPlan = generateWeeklyPlan(demoProfile, demoTargets, startOfWeekISO())
          await dataStore.saveProfile(demoProfile)
          await dataStore.saveNutritionTargets(user.id, demoTargets)
          await dataStore.saveMealPlan(demoPlan)
          const demoList = buildShoppingList(demoPlan, demoProfile)
          await dataStore.saveShoppingList(demoList)
          if (!active) return
          setProfile(demoProfile)
          setTargets(demoTargets)
          setPlan(demoPlan)
          setShoppingList(demoList)
          setWeightEntries([])
          setLoading(false)
          return
        }
      }

      const [loadedProfile, loadedTargets, loadedPlan, loadedList, loadedWeights] = await Promise.all([
        dataStore.getProfile(user.id),
        dataStore.getNutritionTargets(user.id),
        dataStore.getMealPlan(user.id),
        dataStore.getShoppingList(user.id),
        dataStore.getWeightEntries(user.id),
      ])
      if (!active) return
      setProfile(loadedProfile)
      setTargets(loadedTargets)
      setPlan(loadedPlan)
      setShoppingList(loadedList)
      setWeightEntries(loadedWeights)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [user, isDemo, dataStore, authLoading])

  const saveProfileAndGenerate = React.useCallback(
    async (newProfile: UserProfile) => {
      setGenerating(true)
      try {
        const newTargets = calculateNutritionTargets(newProfile)
        const newPlan = generateWeeklyPlan(newProfile, newTargets, startOfWeekISO())
        await dataStore.saveProfile(newProfile)
        await dataStore.saveNutritionTargets(newProfile.userId, newTargets)
        await dataStore.saveMealPlan(newPlan)
        const newList = buildShoppingList(newPlan, newProfile)
        await dataStore.saveShoppingList(newList)
        setProfile(newProfile)
        setTargets(newTargets)
        setPlan(newPlan)
        setShoppingList(newList)
      } finally {
        setGenerating(false)
      }
    },
    [dataStore],
  )

  const updateProfile = React.useCallback(
    async (partial: Partial<UserProfile>, opts?: { regenerate?: boolean }) => {
      if (!profile) return
      const updated: UserProfile = { ...profile, ...partial, updatedAt: new Date().toISOString() }
      await dataStore.saveProfile(updated)
      setProfile(updated)

      if (opts?.regenerate) {
        setGenerating(true)
        try {
          const newTargets = calculateNutritionTargets(updated)
          const newPlan = generateWeeklyPlan(updated, newTargets, startOfWeekISO())
          await dataStore.saveNutritionTargets(updated.userId, newTargets)
          await dataStore.saveMealPlan(newPlan)
          setTargets(newTargets)
          setPlan(newPlan)
          await regenerateShoppingList(newPlan, updated)
        } finally {
          setGenerating(false)
        }
      } else {
        const newTargets = calculateNutritionTargets(updated)
        await dataStore.saveNutritionTargets(updated.userId, newTargets)
        setTargets(newTargets)
      }
    },
    [profile, dataStore, regenerateShoppingList],
  )

  const regeneratePlan = React.useCallback(async () => {
    if (!profile || !targets) return
    setGenerating(true)
    try {
      const newPlan = generateWeeklyPlan(profile, targets, startOfWeekISO())
      await dataStore.saveMealPlan(newPlan)
      setPlan(newPlan)
      await regenerateShoppingList(newPlan, profile)
    } finally {
      setGenerating(false)
    }
  }, [profile, targets, dataStore, regenerateShoppingList])

  const swapMeal = React.useCallback(
    async (slotId: string, newMealId: string) => {
      if (!plan || !profile) return
      const updated = swapMealInPlan(plan, slotId, newMealId)
      await dataStore.saveMealPlan(updated)
      setPlan(updated)
      await regenerateShoppingList(updated, profile)
    },
    [plan, profile, dataStore, regenerateShoppingList],
  )

  const removeMeal = React.useCallback(
    async (slotId: string) => {
      if (!plan || !profile) return
      const updated = removeMealFromPlan(plan, slotId)
      await dataStore.saveMealPlan(updated)
      setPlan(updated)
      await regenerateShoppingList(updated, profile)
    },
    [plan, profile, dataStore, regenerateShoppingList],
  )

  const getAlternativesFor = React.useCallback(
    (type: MealType, currentMealId: string) => {
      if (!profile || !targets) return []
      return getAlternatives(type, currentMealId, profile, targets, 5)
    },
    [profile, targets],
  )

  const submitChangeRequest = React.useCallback(
    async (text: string): Promise<string> => {
      if (!plan || !profile || !targets) return 'Your plan is still loading — try again in a moment.'
      const command = await interpretPlanChangeRequest(text)

      if (command.type === 'make_cheaper') {
        if (!shoppingList) return "You don't have a shopping list yet."
        const result = forceCheaperBasket(shoppingList, profile.supermarket, profile.allergies, getProductById)
        const newList: ShoppingList = {
          ...shoppingList,
          items: result.items,
          estimatedTotal: result.estimatedTotal,
          updatedAt: new Date().toISOString(),
        }
        await dataStore.saveShoppingList(newList)
        setShoppingList(newList)
        return result.notes.length > 0
          ? `Found cheaper swaps on ${result.notes.length} item${result.notes.length === 1 ? '' : 's'} — new estimated total is £${result.estimatedTotal.toFixed(2)}.`
          : 'Your basket already has the cheapest suitable products for every item.'
      }

      if (command.type === 'already_have_ingredient' && shoppingList) {
        const term = command.ingredient.toLowerCase()
        const matching = shoppingList.items.filter((i) => i.ingredientName.toLowerCase().includes(term))
        if (matching.length === 0) {
          return `You don't have "${command.ingredient}" in this week's shopping list.`
        }
        const remaining = shoppingList.items.filter((i) => !matching.includes(i))
        const newTotal = Math.round(remaining.reduce((sum, i) => sum + i.totalPrice, 0) * 100) / 100
        const newList: ShoppingList = {
          ...shoppingList,
          items: remaining,
          estimatedTotal: newTotal,
          updatedAt: new Date().toISOString(),
        }
        await dataStore.saveShoppingList(newList)
        setShoppingList(newList)
        return `Removed ${matching.length} item${matching.length === 1 ? '' : 's'} for "${command.ingredient}" from your shopping list.`
      }

      if (command.type === 'regenerate_plan') {
        await regeneratePlan()
        return 'Generated a fresh weekly plan for you.'
      }

      if (command.type === 'unknown') {
        return command.message
      }

      const result = applyPlanChange(command, plan, profile, targets)
      if (result.changed) {
        await dataStore.saveMealPlan(result.plan)
        setPlan(result.plan)
        await regenerateShoppingList(result.plan, profile)
      }
      return result.message || "I've made that update."
    },
    [plan, profile, targets, shoppingList, dataStore, getProductById, regenerateShoppingList, regeneratePlan],
  )

  const updateShoppingItemQuantity = React.useCallback(
    async (itemId: string, quantity: number) => {
      if (!shoppingList) return
      const items = shoppingList.items
        .map((item) => {
          if (item.id !== itemId) return item
          if (quantity <= 0) return null
          const unitPrice = item.unitPrice
          return { ...item, quantity, totalPrice: Math.round(unitPrice * quantity * 100) / 100 }
        })
        .filter((i): i is NonNullable<typeof i> => i !== null)
      const estimatedTotal = Math.round(items.reduce((sum, i) => sum + i.totalPrice, 0) * 100) / 100
      const newList: ShoppingList = { ...shoppingList, items, estimatedTotal, updatedAt: new Date().toISOString() }
      await dataStore.saveShoppingList(newList)
      setShoppingList(newList)
    },
    [shoppingList, dataStore],
  )

  const addWeightEntry = React.useCallback(
    async (weightKg: number) => {
      if (!user) return
      const entry: WeightEntry = {
        id: `weight-${crypto.randomUUID()}`,
        userId: user.id,
        date: new Date().toISOString().slice(0, 10),
        weightKg,
      }
      await dataStore.addWeightEntry(entry)
      setWeightEntries((prev) => [...prev, entry])
    },
    [user, dataStore],
  )

  const value: PlanContextValue = {
    profile,
    targets,
    plan,
    shoppingList,
    weightEntries,
    loading,
    generating,
    saveProfileAndGenerate,
    updateProfile,
    regeneratePlan,
    swapMeal,
    removeMeal,
    getAlternativesFor,
    submitChangeRequest,
    updateShoppingItemQuantity,
    addWeightEntry,
    getProductById,
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan() {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used within PlanProvider')
  return ctx
}
