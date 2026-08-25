import { ArrowRight, CheckCircle2, PiggyBank, Salad, ShoppingBasket, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPlaceholderImage } from '@/lib/placeholderImage'

const FEATURES = [
  {
    icon: Salad,
    title: 'Personalised Nutrition',
    description: 'Plans built around your goals, dietary requirements and preferences.',
  },
  {
    icon: ShoppingBasket,
    title: 'Smart Shopping',
    description: 'Turn your meal plan into a complete weekly grocery basket.',
  },
  {
    icon: PiggyBank,
    title: 'Built Around Your Budget',
    description: 'Choose your supermarket and keep your weekly shop within budget.',
  },
]

const STEPS = [
  'Tell us about yourself',
  'Choose your supermarket',
  'Get your weekly plan',
  'Review your basket',
  'Shop',
]

const SUPERMARKET_NAMES = [
  'Tesco',
  "Sainsbury's",
  'ASDA',
  'Morrisons',
  'Waitrose',
  'Ocado',
  'Aldi',
  'Lidl',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { continueAsDemo } = useAuth()

  function handleTryDemo() {
    continueAsDemo()
    navigate('/dashboard')
  }

  return (
    <div className="bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
          <span className="font-display text-lg font-bold text-foreground">Meetlou</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button variant="outline" onClick={handleTryDemo}>
            Try Demo
          </Button>
          <Button onClick={() => navigate('/signup')}>Build My Plan</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-10 md:grid-cols-2 md:pb-24 md:pt-16">
        <div>
          <Badge variant="brand" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Personalised for you, weekly
          </Badge>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Your goals. Your meals.{' '}
            <span className="text-primary">Your weekly shop.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Tell us what you're trying to achieve, what you can eat, and what you want to spend. We'll
            build your personalised weekly meal plan and shopping basket.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Build My Plan <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            No credit card needed &middot; Try the full demo instantly
          </div>
        </div>
        <div className="relative">
          <Card className="overflow-hidden">
            <img
              src={getPlaceholderImage('Meetlou weekly plan', 900)}
              alt="A colourful, healthy weekly meal spread"
              className="h-72 w-full object-cover sm:h-96"
            />
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
              <div className="p-4 text-center">
                <p className="font-display text-xl font-bold text-foreground">2,350</p>
                <p className="text-xs text-muted-foreground">kcal / day</p>
              </div>
              <div className="p-4 text-center">
                <p className="font-display text-xl font-bold text-foreground">£71.42</p>
                <p className="text-xs text-muted-foreground">est. weekly shop</p>
              </div>
              <div className="p-4 text-center">
                <p className="font-display text-xl font-bold text-foreground">7 days</p>
                <p className="text-xs text-muted-foreground">fully planned</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            From your goals to your trolley, in five simple steps.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <div key={step} className="relative">
              <Card className="h-full p-6 text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-foreground">{step}</p>
              </Card>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {SUPERMARKET_NAMES.map((name) => (
            <Badge key={name} variant="outline" className="px-3 py-1.5 text-sm">
              {name}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Supermarket integration coming soon — your selection determines the seeded product catalogue used for this demo.
        </p>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Card className="overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white sm:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to build your plan?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Set up your profile in a couple of minutes and get a full week of meals and a
            ready-to-shop grocery basket.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-brand-800 hover:bg-brand-50"
              onClick={() => navigate('/signup')}
            >
              Build My Plan <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" onClick={handleTryDemo}>
              Try the Demo
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Meetlou. Nutrition estimates are for general wellness planning
        and are not medical advice.
      </footer>
    </div>
  )
}
