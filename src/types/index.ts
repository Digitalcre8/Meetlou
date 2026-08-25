// Core domain types for Meetlou — the AI personalised grocery & fitness meal planner.
// Kept independent of any storage/AI provider so services can be swapped later.

export type Goal =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain_weight'
  | 'improve_nutrition'
  | 'eat_healthier'
  | 'other'

export type Sex = 'male' | 'female' | 'other'

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active'

export type DietaryRequirement =
  | 'no_preference'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'gluten_free'
  | 'dairy_free'
  | 'other'

export type Allergen =
  | 'peanuts'
  | 'tree_nuts'
  | 'milk'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'soy'
  | 'wheat_gluten'
  | 'sesame'
  | 'other'

export type SupermarketId =
  | 'tesco'
  | 'sainsburys'
  | 'asda'
  | 'morrisons'
  | 'waitrose'
  | 'ocado'
  | 'aldi'
  | 'lidl'
  | 'iceland'
  | 'coop'

export type HouseholdSize = 1 | 2 | 3 | 4 | 5

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface UserProfile {
  id: string
  userId: string
  fullName: string
  email: string
  goal: Goal
  goalOther?: string
  age: number
  sex: Sex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  dietaryRequirements: DietaryRequirement[]
  allergies: Allergen[]
  allergiesOther?: string
  likedFoods: string[]
  dislikedFoods: string[]
  householdSize: HouseholdSize
  weeklyBudget: number
  supermarket: SupermarketId
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface NutritionTargets extends Macros {
  bmr: number
  tdee: number
  updatedAt: string
}

export interface Ingredient {
  name: string
  quantity: number
  unit: string
  /** Loose category used to match against the seeded product catalogue. */
  category: ProductCategory
  /** Allergens inherently present in this raw ingredient (e.g. "eggs" for egg). */
  allergens?: Allergen[]
}

export interface Recipe {
  id: string
  method: string[]
  servings: number
  prepTimeMinutes: number
  cookTimeMinutes: number
  ingredients: Ingredient[]
}

export interface Meal {
  id: string
  name: string
  description: string
  type: MealType
  imageUrl: string
  macros: Macros
  prepTimeMinutes: number
  tags: string[]
  dietaryRequirements: DietaryRequirement[]
  allergens: Allergen[]
  recipe: Recipe
}

export interface MealPlanSlot {
  id: string
  day: number // 0 = Monday .. 6 = Sunday
  type: MealType
  mealId: string
}

export interface MealPlan {
  id: string
  userId: string
  weekStarting: string
  slots: MealPlanSlot[]
  createdAt: string
  updatedAt: string
}

export type ProductCategory =
  | 'produce'
  | 'meat_fish'
  | 'dairy_eggs'
  | 'carbohydrates'
  | 'frozen'
  | 'cupboard'
  | 'snacks'
  | 'drinks'

export interface Product {
  id: string
  supermarket: SupermarketId
  name: string
  brand: string
  category: ProductCategory
  size: string
  unitQuantity: number
  unit: string
  price: number
  macros: Macros
  ingredientTags: string[]
  allergens: Allergen[]
  imageUrl: string
  available: boolean
}

export interface ShoppingListItem {
  id: string
  ingredientName: string
  category: ProductCategory
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  matchedFor: string[] // meal names this ingredient came from
  substitutionNote?: string
}

export interface ShoppingList {
  id: string
  userId: string
  mealPlanId: string
  supermarket: SupermarketId
  items: ShoppingListItem[]
  estimatedTotal: number
  budget: number
  createdAt: string
  updatedAt: string
}

export interface WeightEntry {
  id: string
  userId: string
  date: string
  weightKg: number
}

export interface AdherenceEntry {
  id: string
  userId: string
  date: string
  mealsCompleted: number
  mealsPlanned: number
}
