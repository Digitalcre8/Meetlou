import type { UserProfile } from '@/types'

/** Matches the demo user described in the product spec: build muscle, ~2,600 kcal / 180g protein, £80 budget, peanut allergy, Tesco. */
export function buildDemoProfile(userId: string): UserProfile {
  const now = new Date().toISOString()
  return {
    id: `profile-${userId}`,
    userId,
    fullName: 'Alex',
    email: 'demo@meetlou.app',
    goal: 'build_muscle',
    age: 27,
    sex: 'male',
    heightCm: 180,
    weightKg: 90,
    activityLevel: 'sedentary',
    dietaryRequirements: ['no_preference'],
    allergies: ['peanuts'],
    likedFoods: ['chicken', 'rice', 'eggs', 'greek yoghurt'],
    dislikedFoods: [],
    householdSize: 1,
    // A full week's shop for one person includes several pantry staples
    // (protein powder, oils, spices) that last well beyond a single week,
    // so a first-time basket runs higher than a typical repeat weekly shop.
    weeklyBudget: 150,
    supermarket: 'tesco',
    onboardingComplete: true,
    createdAt: now,
    updatedAt: now,
  }
}
