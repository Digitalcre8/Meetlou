import * as React from 'react'
import { RefreshCw } from 'lucide-react'
import { usePlan } from '@/contexts/PlanContext'
import { ACTIVITY_LEVEL_LABELS } from '@/services/nutritionService'
import { ALLERGEN_LABELS } from '@/services/allergenService'
import { DIETARY_LABELS } from '@/services/dietaryService'
import { SUPERMARKETS } from '@/data/seed/supermarkets'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { TagInput } from '@/components/onboarding/TagInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { formatCurrencyGBP } from '@/lib/utils'
import type { ActivityLevel, Allergen, DietaryRequirement, Goal, HouseholdSize, Sex, SupermarketId, UserProfile } from '@/types'

const GOALS: Goal[] = ['lose_weight', 'build_muscle', 'maintain_weight', 'improve_nutrition', 'eat_healthier', 'other']
const DIETS: DietaryRequirement[] = ['no_preference', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'gluten_free', 'dairy_free', 'other']
const ALLERGENS: Allergen[] = ['peanuts', 'tree_nuts', 'milk', 'eggs', 'fish', 'shellfish', 'soy', 'wheat_gluten', 'sesame', 'other']
const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
const HOUSEHOLD_SIZES: { value: HouseholdSize; label: string }[] = [
  { value: 1, label: 'Just me' },
  { value: 2, label: '2 people' },
  { value: 3, label: '3 people' },
  { value: 4, label: '4 people' },
  { value: 5, label: '5+ people' },
]

export default function SettingsPage() {
  const { profile, updateProfile, generating } = usePlan()
  const { toast } = useToast()
  const [draft, setDraft] = React.useState<UserProfile | null>(profile)
  const [needsRegenerate, setNeedsRegenerate] = React.useState(false)

  React.useEffect(() => {
    setDraft(profile)
  }, [profile])

  if (!draft) {
    return (
      <Card className="p-12 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Loading your profile…</p>
      </Card>
    )
  }

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleSave(regenerateEligible: boolean) {
    if (!draft) return
    await updateProfile(draft)
    toast({ title: 'Settings saved', description: 'Your profile has been updated.' })
    if (regenerateEligible) setNeedsRegenerate(true)
  }

  async function handleRegenerate() {
    if (!draft) return
    await updateProfile(draft, { regenerate: true })
    setNeedsRegenerate(false)
    toast({ title: 'Plan regenerated', description: 'Your meal plan now reflects your updated profile.' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile, goals and preferences.</p>
      </div>

      {needsRegenerate && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50 p-4">
          <p className="text-sm text-brand-800">
            You've changed something that affects your nutrition targets or meals.
          </p>
          <Button size="sm" onClick={handleRegenerate} disabled={generating}>
            <RefreshCw className="h-4 w-4" /> {generating ? 'Regenerating…' : 'Regenerate this week\'s plan'}
          </Button>
        </Card>
      )}

      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="goals">Fitness goals</TabsTrigger>
          <TabsTrigger value="diet">Dietary</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="shopping">Budget & Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>Used to estimate your daily nutrition targets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Age</Label>
                  <Input type="number" value={draft.age} onChange={(e) => set('age', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sex</Label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'other'] as Sex[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set('sex', s)}
                        className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium capitalize ${draft.sex === s ? 'border-primary bg-brand-50 text-brand-700' : 'border-border text-muted-foreground'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={draft.heightCm} onChange={(e) => set('heightCm', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={draft.weightKg} onChange={(e) => set('weightKg', Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={() => handleSave(true)}>Save personal details</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Fitness goals</CardTitle>
              <CardDescription>Drives your calorie and protein targets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <SelectableCard
                    key={g}
                    label={g === 'other' ? draft.goalOther || 'Other' : g.replace('_', ' ')}
                    selected={draft.goal === g}
                    onClick={() => set('goal', g)}
                  />
                ))}
              </div>
              <div className="space-y-1.5">
                <Label>Activity level</Label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map((a) => (
                    <SelectableCard
                      key={a}
                      label={ACTIVITY_LEVEL_LABELS[a]}
                      selected={draft.activityLevel === a}
                      onClick={() => set('activityLevel', a)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={() => handleSave(true)}>Save goals</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet">
          <Card>
            <CardHeader>
              <CardTitle>Dietary requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {DIETS.map((d) => (
                  <SelectableCard
                    key={d}
                    label={DIETARY_LABELS[d]}
                    selected={draft.dietaryRequirements.includes(d)}
                    onClick={() =>
                      set(
                        'dietaryRequirements',
                        draft.dietaryRequirements.includes(d)
                          ? draft.dietaryRequirements.filter((x) => x !== d)
                          : [...draft.dietaryRequirements, d],
                      )
                    }
                  />
                ))}
              </div>
              <Button onClick={() => handleSave(true)}>Save dietary requirements</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies">
          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>We filter these out of your meals and shopping list automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {ALLERGENS.map((a) => (
                  <SelectableCard
                    key={a}
                    label={ALLERGEN_LABELS[a]}
                    selected={draft.allergies.includes(a)}
                    onClick={() =>
                      set(
                        'allergies',
                        draft.allergies.includes(a) ? draft.allergies.filter((x) => x !== a) : [...draft.allergies, a],
                      )
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Always check product packaging and allergen information. This app is not a substitute for medical advice.
              </p>
              <Button onClick={() => handleSave(true)}>Save allergies</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Food preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Foods you love</Label>
                <div className="mt-2">
                  <TagInput value={draft.likedFoods} onChange={(v) => set('likedFoods', v)} />
                </div>
              </div>
              <div>
                <Label>Foods you dislike</Label>
                <div className="mt-2">
                  <TagInput value={draft.dislikedFoods} onChange={(v) => set('dislikedFoods', v)} />
                </div>
              </div>
              <Button onClick={() => handleSave(false)}>Save preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle>Household, budget & supermarket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Household size</Label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {HOUSEHOLD_SIZES.map((h) => (
                    <SelectableCard
                      key={h.value}
                      label={h.label}
                      selected={draft.householdSize === h.value}
                      onClick={() => set('householdSize', h.value)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Weekly budget: {formatCurrencyGBP(draft.weeklyBudget)}{draft.weeklyBudget >= 200 ? '+' : ''}</Label>
                <div className="mt-3">
                  <Slider min={40} max={200} step={5} value={[draft.weeklyBudget]} onValueChange={([v]) => set('weeklyBudget', v)} />
                </div>
              </div>
              <div>
                <Label>Preferred supermarket</Label>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SUPERMARKETS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => set('supermarket', s.id as SupermarketId)}
                      className={`rounded-2xl border-2 p-3 text-center text-sm font-semibold ${draft.supermarket === s.id ? 'border-primary bg-brand-50' : 'border-border'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Supermarket integration coming soon.</p>
              </div>
              <Button onClick={() => handleSave(true)}>Save budget & supermarket</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
