// Generates a deterministic, on-brand SVG placeholder image as a data URI —
// no network request required, so photography always renders even with no
// internet access. Used for every seeded meal/product image (and the
// landing page hero) in place of external stock photo URLs.

const PALETTES: [string, string][] = [
  ['#eef6ea', '#8fce7f'],
  ['#fef3e2', '#f4b860'],
  ['#fde8e8', '#e8837a'],
  ['#eaf4f6', '#7ec8d9'],
  ['#f4eee8', '#c9a06a'],
  ['#f1f5e9', '#a3c15a'],
  ['#fdf0f6', '#e08fb0'],
  ['#eef0fb', '#8f9ee0'],
]

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function getPlaceholderImage(seed: string, size = 480): string {
  const hash = hashString(seed)
  const [bg, accent] = PALETTES[hash % PALETTES.length]
  const initial = (seed.trim()[0] || '?').toUpperCase()
  const cx = 30 + (hash % 40)
  const cy = 25 + ((hash >> 4) % 30)
  const r1 = size * 0.55
  const r2 = size * 0.32

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bg}" />
    <circle cx="${(cx / 100) * size}" cy="${(cy / 100) * size}" r="${r1}" fill="${accent}" fill-opacity="0.35" />
    <circle cx="${size - (cx / 100) * size}" cy="${size - (cy / 100) * size}" r="${r2}" fill="${accent}" fill-opacity="0.45" />
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.22}" fill="#ffffff" fill-opacity="0.85" />
    <text x="50%" y="52%" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="${size * 0.16}" font-weight="700" fill="${accent}" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
