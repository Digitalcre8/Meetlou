// Lightweight password hashing for the local (no-Supabase) demo auth
// fallback only. Real accounts always go through Supabase Auth — this is
// never used once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
