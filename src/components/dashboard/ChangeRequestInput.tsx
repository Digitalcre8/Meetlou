import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePlan } from '@/contexts/PlanContext'
import { useToast } from '@/components/ui/toast'

const SUGGESTIONS = [
  "Make this week's shop cheaper",
  'Give me more high-protein meals',
  "I don't want fish this week",
  'Replace my lunches',
]

export function ChangeRequestInput() {
  const { submitChangeRequest } = usePlan()
  const { toast } = useToast()
  const [text, setText] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const message = await submitChangeRequest(text)
      toast({ title: 'Plan updated', description: message })
      setText('')
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Sparkles className="h-4 w-4" />
        </span>
        <h3 className="font-display text-sm font-semibold text-foreground">What would you like to change?</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Make this week's shop cheaper"
          disabled={submitting}
        />
        <Button type="submit" disabled={submitting || !text.trim()}>
          {submitting ? 'Thinking…' : 'Send'}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setText(s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
