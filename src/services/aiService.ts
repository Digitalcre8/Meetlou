// AI service abstraction. The rest of the app (nutritionService,
// mealPlanService, recipeService, productMatchingService) never talks to an
// AI provider directly — everything goes through here, so a real model can
// be wired in later without touching UI or the deterministic engines.
//
// SECURITY NOTE: a provider API key must never be shipped to the browser
// bundle. In production, `isAIConfigured` would reflect whether a secure
// server/edge function has a key configured, and `interpretPlanChangeRequest`
// would call that backend rather than a third-party API directly from the
// client. For this MVP there is no backend function deployed, so the
// deterministic command parser below is always used — the app is fully
// functional without any AI key.

import type { MealType } from '@/types'

export type PlanChangeCommand =
  | { type: 'make_cheaper' }
  | { type: 'more_protein' }
  | { type: 'exclude_ingredient'; ingredient: string }
  | { type: 'replace_meal_type'; mealType: MealType }
  | { type: 'already_have_ingredient'; ingredient: string }
  | { type: 'regenerate_plan' }
  | { type: 'unknown'; message: string }

/** Whether a real AI provider is configured. Always false in this MVP — see note above. */
export function isAIConfigured(): boolean {
  return Boolean(import.meta.env.VITE_AI_ENABLED === 'true')
}

const MEAL_TYPE_WORDS: Record<string, MealType> = {
  breakfast: 'breakfast',
  breakfasts: 'breakfast',
  lunch: 'lunch',
  lunches: 'lunch',
  dinner: 'dinner',
  dinners: 'dinner',
  snack: 'snack',
  snacks: 'snack',
}

/**
 * Deterministic natural-language command interpreter. Understands a small,
 * well-defined set of phrasings (per the MVP spec) without calling any AI
 * provider. If `isAIConfigured()` is ever true, a real model call would
 * replace this parsing step while returning the same PlanChangeCommand shape.
 */
export async function interpretPlanChangeRequest(rawText: string): Promise<PlanChangeCommand> {
  const text = rawText.trim().toLowerCase()

  if (!text) return { type: 'unknown', message: 'Please describe what you would like to change.' }

  if (/cheap|budget|save money|lower cost|reduce cost/.test(text)) {
    return { type: 'make_cheaper' }
  }

  if (/(more|higher|increase).*protein|protein.*(please|more)/.test(text) || /high.protein/.test(text)) {
    return { type: 'more_protein' }
  }

  const alreadyHaveMatch = text.match(/already have (?:some |a |an )?([a-z\s]+?)(?:\s+at home)?$/)
  if (alreadyHaveMatch) {
    return { type: 'already_have_ingredient', ingredient: alreadyHaveMatch[1].trim() }
  }

  const dontWantMatch = text.match(/(?:don't want|do not want|no more|avoid|without)\s+([a-z\s]+?)(?:\s+this week)?$/)
  if (dontWantMatch) {
    return { type: 'exclude_ingredient', ingredient: dontWantMatch[1].trim() }
  }

  const replaceMatch = text.match(/replace (?:my |the )?(\w+)/)
  if (replaceMatch && MEAL_TYPE_WORDS[replaceMatch[1]]) {
    return { type: 'replace_meal_type', mealType: MEAL_TYPE_WORDS[replaceMatch[1]] }
  }

  for (const [word, mealType] of Object.entries(MEAL_TYPE_WORDS)) {
    if (text.includes(word) && /swap|change|new|different/.test(text)) {
      return { type: 'replace_meal_type', mealType }
    }
  }

  if (/regenerate|start over|new plan|whole plan/.test(text)) {
    return { type: 'regenerate_plan' }
  }

  return {
    type: 'unknown',
    message:
      "I couldn't quite understand that. Try things like \"make this week's shop cheaper\", \"give me more high-protein meals\", or \"I don't want fish this week\".",
  }
}
