import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export default function ResetPasswordPage() {
  const { resetPassword, usingSupabase } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(email, newPassword || undefined)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthLayout
        title="Check your details"
        subtitle={usingSupabase ? 'A password reset link is on its way.' : 'Your password has been updated.'}
      >
        <p className="text-sm text-muted-foreground">
          {usingSupabase
            ? "If an account exists for that email, we've sent a link to reset your password."
            : 'You can now log in with your new password.'}
        </p>
        <Button className="mt-6 w-full" onClick={() => navigate('/login')}>
          Back to login
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        usingSupabase
          ? "Enter your email and we'll send you a reset link."
          : 'This demo runs without email delivery, so set your new password directly below.'
      }
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {!usingSupabase && (
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Please wait…' : usingSupabase ? 'Send reset link' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
