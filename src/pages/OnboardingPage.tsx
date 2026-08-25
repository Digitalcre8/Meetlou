import * as React from 'react'
import {
  Apple,
  Armchair,
  Bike,
  Dumbbell,
  Flame,
  HeartPulse,
  MoreHorizontal,
  PersonStanding,
  Scale,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/PlanContext'
import { ACTIVITY_LEVEL_DESCRIPTIONS, ACTIVITY_LEVEL_LABELS } from '@/services/nutritionService'
import { ALLERGEN_DISCLAIMER, ALLERGEN_LABELS } from '@/services/allergenService'
import { DIETARY_LABELS } from '@/services/dietaryService'
import { SUPERMARKETS } from '@/data/seed/supermarkets'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { StepProgress } from '@/components/onboarding/StepProgress'
import { TagInput } from '@/components/onboarding/TagInput'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { formatCurrencyGBP, titleCase } from '@/lib/utils'
import type {
  ActivityLevel,
  Allergen,
  DietaryRequirement,
  Goal,
  HouseholdSize,
  Sex,
  SupermarketId,
  UserProfile,
} from '@/types'

const TOTAL_STEPS = 9

const GOAL_OPTIONS: { value: Goal; label: string; icon: typeof TrendingDown }[] = [
  { value: 'lose_weight', label: 'Lose weight', icon: TrendingDown },
  { value: 'build_muscle', label: 'Build muscle', icon: Dumbbell },
  { value: 'maintain_weight', label: 'Maintain weight', icon: Scale },
  { value: 'improve_nutrition', label: 'Improve general nutrition', icon: Apple },
  { value: 'eat_healthier', label: 'Eat healthier', icon: HeartPulse },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
]

const ACTIVITY_OPTIONS: { value: ActivityLevel; icon: typeof Armchair }[] = [
  { value: 'sedentary', icon: Armchair },
  { value: 'lightly_active', icon: PersonStanding },
  { value: 'moderately_active', icon: Bike },
  { value: 'very_active', icon: Flame },
  { value: 'extremely_active', icon: Zap },
]

const DIET_OPTIONS: DietaryRequirement[] = [
  'no_preference',
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
  'kosher',
  'gluten_free',
  'dairy_free',
  'other',
]

const ALLERGEN_OPTIONS: Allergen[] = [
  'peanuts',
  'tree_nuts',
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'soy',
  'wheat_gluten',
  'sesame',
  'other',
]

const HOUSEHOLD_OPTIONS: { value: HouseholdSize; label: string }[] = [
  { value: 1, label: 'Just me' },
  { value: 2, label: '2 people' },
  { value: 3, label: '3 people' },
  { value: 4, label: '4 people' },
  { value: 5, label: '5+ people' },
]

interface Draft {
  goal?: Goal
  goalOther: string
  age: string
  sex?: Sex
  heightCm: string
  weightKg: string
  activityLevel?: ActivityLevel
  dietaryRequirements: DietaryRequirement[]
  allergies: Allergen[]
  allergiesOther: string
  likedFoods: string[]
  dislikedFoods: string[]
  householdSize?: HouseholdSize
  weeklyBudget: number
  supermarket?: SupermarketId
}

const INITIAL_DRAFT: Draft = {
  goalOther: '',
  age: '',
  heightCm: '',
  weightKg: '',
  dietaryRequirements: [],
  allergies: [],
  allergiesOther: '',
  likedFoods: [],
  dislikedFoods: [],
  weeklyBudget: 80,
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const { saveProfileAndGenerate, generating } = usePlan()
  const navigate = useNavigate()

  const [step, setStep] = React.useState(1)
  const [draft, setDraft] = React.useState<Draft>(INITIAL_DRAFT)

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function toggleDiet(value: DietaryRequirement) {
    setDraft((prev) => {
      if (value === 'no_preference') {
        return { ...prev, dietaryRequirements: prev.dietaryRequirements.includes('no_preference') ? [] : ['no_preference'] }
      }
      const withoutNoPreference = prev.dietaryRequirements.filter((d) => d !== 'no_preference')
      const has = withoutNoPreference.includes(value)
      return {
        ...prev,
        dietaryRequirements: has ? withoutNoPreference.filter((d) => d !== value) : [...withoutNoPreference, value],
      }
    })
  }

  function toggleAllergy(value: Allergen) {
    setDraft((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(value)
        ? prev.allergies.filter((a) => a !== value)
        : [...prev.allergies, value],
    }))
  }

  const canContinue = React.useMemo(() => {
    switch (step) {
      case 1:
        return Boolean(draft.goal) && (draft.goal !== 'other' || draft.goalOther.trim().length > 0)
      case 2:
        return Boolean(draft.age && draft.sex && draft.heightCm && draft.weightKg && draft.activityLevel)
      case 3:
        return draft.dietaryRequirements.length > 0
      case 4:
        return true
      case 5:
        return true
      case 6:
        return Boolean(draft.householdSize)
      case 7:
        return draft.weeklyBudget >= 40
      case 8:
        return Boolean(draft.supermarket)
      default:
        return true
    }
  }, [step, draft])

  async function handleFinish() {
    if (!user) return
    const now = new Date().toISOString()
    const profile: UserProfile = {
      id: `profile-${user.id}`,
      userId: user.id,
      fullName: user.fullName || user.email,
      email: user.email,
      goal: draft.goal!,
      goalOther: draft.goal === 'other' ? draft.goalOther : undefined,
      age: Number(draft.age),
      sex: draft.sex!,
      heightCm: Number(draft.heightCm),
      weightKg: Number(draft.weightKg),
      activityLevel: draft.activityLevel!,
      dietaryRequirements: draft.dietaryRequirements,
      allergies: draft.allergies,
      allergiesOther: draft.allergiesOther || undefined,
      likedFoods: draft.likedFoods,
      dislikedFoods: draft.dislikedFoods,
      householdSize: draft.householdSize!,
      weeklyBudget: draft.weeklyBudget,
      supermarket: draft.supermarket!,
      onboardingComplete: true,
      createdAt: now,
      updatedAt: now,
    }
    await saveProfileAndGenerate(profile)
    navigate('/dashboard')
  }

  if (generating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-6 text-center">
        <div className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-brand-200 border-t-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Building your weekly plan…</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Matching meals to your goals, checking allergens, and putting together your shopping basket.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/40 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
          <span className="font-display text-lg font-bold text-foreground">Meetlou</span>
        </div>

        <Card className="p-6 sm:p-8">
          <StepProgress step={step} totalSteps={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">What is your goal?</h2>
              <p className="mt-1 text-muted-foreground">Pick the one that fits best — you can change this later.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {GOAL_OPTIONS.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    icon={opt.icon}
                    selected={draft.goal === opt.value}
                    onClick={() => update('goal', opt.value)}
                  />
                ))}
              </div>
              {draft.goal === 'other' && (
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="goalOther">Tell us more</Label>
                  <Input
                    id="goalOther"
                    value={draft.goalOther}
                    onChange={(e) => update('goalOther', e.target.value)}
                    placeholder="e.g. training for a 10k"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">About you</h2>
              <p className="mt-1 text-muted-foreground">This helps us estimate your daily nutrition targets.</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={13}
                    max={100}
                    value={draft.age}
                    onChange={(e) => update('age', e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sex</Label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'other'] as Sex[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update('sex', s)}
                        className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium capitalize transition-colors ${
                          draft.sex === s ? 'border-primary bg-brand-50 text-brand-700' : 'border-border text-muted-foreground hover:border-brand-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={100}
                    max={250}
                    value={draft.heightCm}
                    onChange={(e) => update('heightCm', e.target.value)}
                    placeholder="175"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={30}
                    max={250}
                    value={draft.weightKg}
                    onChange={(e) => update('weightKg', e.target.value)}
                    placeholder="72"
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label>Activity level</Label>
                <div className="mt-2 space-y-2">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <SelectableCard
                      key={opt.value}
                      label={ACTIVITY_LEVEL_LABELS[opt.value]}
                      description={ACTIVITY_LEVEL_DESCRIPTIONS[opt.value]}
                      icon={opt.icon}
                      selected={draft.activityLevel === opt.value}
                      onClick={() => update('activityLevel', opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Dietary requirements</h2>
              <p className="mt-1 text-muted-foreground">Select all that apply.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {DIET_OPTIONS.map((opt) => (
                  <SelectableCard
                    key={opt}
                    label={DIETARY_LABELS[opt]}
                    selected={draft.dietaryRequirements.includes(opt)}
                    onClick={() => toggleDiet(opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Allergies</h2>
              <p className="mt-1 text-muted-foreground">We'll filter these out of your meals and shopping list.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ALLERGEN_OPTIONS.map((opt) => (
                  <SelectableCard
                    key={opt}
                    label={ALLERGEN_LABELS[opt]}
                    selected={draft.allergies.includes(opt)}
                    onClick={() => toggleAllergy(opt)}
                  />
                ))}
              </div>
              {draft.allergies.includes('other') && (
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="allergiesOther">Tell us more</Label>
                  <Input
                    id="allergiesOther"
                    value={draft.allergiesOther}
                    onChange={(e) => update('allergiesOther', e.target.value)}
                    placeholder="e.g. mustard"
                  />
                </div>
              )}
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {ALLERGEN_DISCLAIMER}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Food preferences</h2>
              <p className="mt-1 text-muted-foreground">This helps us pick meals you'll actually enjoy.</p>
              <div className="mt-6 space-y-5">
                <div>
                  <Label>What foods do you love?</Label>
                  <div className="mt-2">
                    <TagInput
                      value={draft.likedFoods}
                      onChange={(v) => update('likedFoods', v)}
                      placeholder="Chicken, rice, pasta, eggs, Greek yoghurt, steak…"
                    />
                  </div>
                </div>
                <div>
                  <Label>What foods do you dislike?</Label>
                  <div className="mt-2">
                    <TagInput
                      value={draft.dislikedFoods}
                      onChange={(v) => update('dislikedFoods', v)}
                      placeholder="Mushrooms, olives…"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Who are you shopping for?</h2>
              <p className="mt-1 text-muted-foreground">We'll scale your shopping list to your household.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {HOUSEHOLD_OPTIONS.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    selected={draft.householdSize === opt.value}
                    onClick={() => update('householdSize', opt.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">What's your weekly grocery budget?</h2>
              <p className="mt-1 text-muted-foreground">We'll build your basket to fit within this.</p>
              <div className="mt-10">
                <p className="text-center font-display text-4xl font-bold text-primary">
                  {formatCurrencyGBP(draft.weeklyBudget)}
                  {draft.weeklyBudget >= 200 ? '+' : ''}
                </p>
                <div className="mt-8">
                  <Slider
                    min={40}
                    max={200}
                    step={5}
                    value={[draft.weeklyBudget]}
                    onValueChange={([v]) => update('weeklyBudget', v)}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>£40</span>
                  <span>£200+</span>
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Choose your preferred supermarket</h2>
              <p className="mt-1 text-muted-foreground">
                Your selection determines the product catalogue and prices we use for your basket.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SUPERMARKETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update('supermarket', s.id)}
                    className={`rounded-2xl border-2 p-4 text-center font-semibold transition-all hover:shadow-sm ${
                      draft.supermarket === s.id ? 'border-primary bg-brand-50' : 'border-border bg-card hover:border-brand-200'
                    }`}
                    style={{ color: draft.supermarket === s.id ? undefined : undefined }}
                  >
                    <span
                      className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: s.color, color: s.textColor }}
                    >
                      {s.shortName.slice(0, 2)}
                    </span>
                    <span className="text-sm">{s.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-xs font-medium text-muted-foreground">
                Supermarket integration coming soon — for now this selects our seeded catalogue and prices.
              </p>
            </div>
          )}

          {step === 9 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Review your details</h2>
              <p className="mt-1 text-muted-foreground">Everything look right?</p>
              <dl className="mt-6 divide-y divide-border rounded-xl border border-border">
                {[
                  ['Goal', draft.goal === 'other' ? draft.goalOther : titleCase(draft.goal ?? '')],
                  ['Diet', draft.dietaryRequirements.map((d) => DIETARY_LABELS[d]).join(', ') || 'None selected'],
                  ['Allergies', draft.allergies.map((a) => ALLERGEN_LABELS[a]).join(', ') || 'None'],
                  ['Loves', draft.likedFoods.join(', ') || 'Not specified'],
                  ['Dislikes', draft.dislikedFoods.join(', ') || 'Not specified'],
                  ['Household', HOUSEHOLD_OPTIONS.find((h) => h.value === draft.householdSize)?.label ?? ''],
                  ['Budget', `${formatCurrencyGBP(draft.weeklyBudget)}${draft.weeklyBudget >= 200 ? '+' : ''} / week`],
                  ['Supermarket', SUPERMARKETS.find((s) => s.id === draft.supermarket)?.name ?? ''],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="font-medium text-muted-foreground">{label}</dt>
                    <dd className="text-right text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
              Back
            </Button>
            {step < TOTAL_STEPS ? (
              <Button onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))} disabled={!canContinue}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleFinish}>Create My Weekly Plan</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

const STEP_LABELS = [
  'Your goal',
  'About you',
  'Dietary requirements',
  'Allergies',
  'Food preferences',
  'Household',
  'Budget',
  'Supermarket',
  'Review',
]
