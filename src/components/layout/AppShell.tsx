import { LayoutDashboard, LogOut, ShoppingBasket, TrendingUp, User, UtensilsCrossed } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/PlanContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard },
  { to: '/meals', label: 'Meal Plan', mobileLabel: 'Meals', icon: UtensilsCrossed },
  { to: '/shopping', label: 'Shopping', mobileLabel: 'Shop', icon: ShoppingBasket },
  { to: '/progress', label: 'Progress', mobileLabel: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Profile', mobileLabel: 'Profile', icon: User },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const { shoppingList } = usePlan()
  const itemCount = shoppingList?.items.length ?? 0

  const initials = (user?.fullName || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 hidden border-b border-border bg-background/90 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                M
              </span>
              <span className="font-display text-lg font-bold text-foreground">Meetlou</span>
            </NavLink>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.to === '/shopping' && itemCount > 0 && (
                    <Badge variant="brand" className="ml-0.5 h-5 min-w-5 justify-center px-1.5">
                      {itemCount}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-12 md:pt-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {item.to === '/shopping' && itemCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </span>
            {item.mobileLabel}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
