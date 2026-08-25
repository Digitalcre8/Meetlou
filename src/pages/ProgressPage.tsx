import * as React from 'react'
import { CalendarCheck, Flame, Scale, Target } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePlan } from '@/contexts/PlanContext'
import { titleCase } from '@/lib/utils'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function ProgressPage() {
  const { profile, targets, plan, weightEntries, addWeightEntry } = usePlan()
  const { toast } = useToast()
  const [weightInput, setWeightInput] = React.useState('')

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(weightInput)
    if (!value || value <= 0) return
    await addWeightEntry(value)
    setWeightInput('')
    toast({ title: 'Weight logged', description: `Added ${value}kg to your progress.` })
  }

  if (!profile || !targets) {
    return (
      <Card className="p-12 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Loading your progress…</p>
      </Card>
    )
  }

  const chartData = [
    { date: 'Start', weight: profile.weightKg },
    ...weightEntries.map((e) => ({ date: e.date.slice(5), weight: e.weightKg })),
  ]

  const expectedSlots = 28
  const adherence = plan ? Math.round((plan.slots.length / expectedSlots) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Your Progress</h1>
        <p className="mt-1 text-muted-foreground">Track how you're trending against your goal.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard icon={Target} label="Goal" value={titleCase(profile.goal)} />
        <SummaryCard icon={Flame} label="Daily calories" value={`${targets.calories}`} suffix="kcal" />
        <SummaryCard icon={Scale} label="Current weight" value={`${weightEntries.at(-1)?.weightKg ?? profile.weightKg}`} suffix="kg" />
        <SummaryCard icon={CalendarCheck} label="Weekly adherence" value={`${adherence}`} suffix="%" tone="brand" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weight over time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--charcoal-300)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--charcoal-300)" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 13 }}
                  formatter={(value) => [`${value}kg`, 'Weight']}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <form onSubmit={handleAddWeight} className="mt-4 flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Log today's weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={`${profile.weightKg}`}
              />
            </div>
            <Button type="submit">Add entry</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily targets</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <TargetStat label="Protein" value={targets.protein} suffix="g" />
          <TargetStat label="Carbs" value={targets.carbs} suffix="g" />
          <TargetStat label="Fat" value={targets.fat} suffix="g" />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        These figures are general wellness estimates, not medical advice. Speak to a healthcare
        professional for guidance specific to you.
      </p>
    </div>
  )
}

function TargetStat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-xl bg-muted p-4 text-center">
      <p className="font-display text-xl font-bold text-foreground">
        {value}
        <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
