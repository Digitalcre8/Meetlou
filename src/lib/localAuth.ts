// Fallback auth used when Supabase isn't configured, so the app is fully
// usable with zero external setup. Not a substitute for real auth security
// — Supabase Auth (email/password, session tokens) is used automatically
// once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.

import { hashPassword } from '@/lib/localHash'

interface LocalUserRecord {
  id: string
  email: string
  fullName: string
  passwordHash: string
}

export interface LocalUser {
  id: string
  email: string
  fullName: string
}

const USERS_KEY = 'meetlou:local_users'
const SESSION_KEY = 'meetlou:local_session'

function readUsers(): LocalUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeUsers(users: LocalUserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getLocalSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as LocalUser) : null
  } catch {
    return null
  }
}

function setSession(user: LocalUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(SESSION_KEY)
}

export async function localSignUp(email: string, password: string, fullName: string): Promise<LocalUser> {
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const record: LocalUserRecord = {
    id: crypto.randomUUID(),
    email,
    fullName,
    passwordHash: await hashPassword(password),
  }
  writeUsers([...users, record])
  const user = { id: record.id, email: record.email, fullName: record.fullName }
  setSession(user)
  return user
}

export async function localSignIn(email: string, password: string): Promise<LocalUser> {
  const users = readUsers()
  const record = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!record) throw new Error('No account found with this email.')
  const hash = await hashPassword(password)
  if (hash !== record.passwordHash) throw new Error('Incorrect password.')
  const user = { id: record.id, email: record.email, fullName: record.fullName }
  setSession(user)
  return user
}

export function localSignOut() {
  setSession(null)
}

export async function localResetPassword(email: string, newPassword: string): Promise<void> {
  const users = readUsers()
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  if (idx === -1) throw new Error('No account found with this email.')
  users[idx] = { ...users[idx], passwordHash: await hashPassword(newPassword) }
  writeUsers(users)
}

export const DEMO_USER: LocalUser = {
  id: 'demo-user',
  email: 'demo@meetlou.app',
  fullName: 'Alex',
}

export function startDemoSession(): LocalUser {
  setSession(DEMO_USER)
  return DEMO_USER
}
