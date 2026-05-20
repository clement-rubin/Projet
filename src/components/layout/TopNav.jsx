import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, FolderKanban, UserCircle2, Menu, X, LogOut, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const STUDENT = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/profile', label: 'Profil', icon: UserCircle2 },
]
const SUPERVISOR = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/projects', label: 'Projets', icon: FolderKanban },
  { to: '/profile', label: 'Profil', icon: UserCircle2 },
]

export default function TopNav() {
  const role = useAuthStore((s) => s.profile?.role)
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const links = role === 'supervisor' ? SUPERVISOR : STUDENT

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-3 sm:top-5 sm:px-6"
      >
        <div
          className={cn(
            'flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 backdrop-blur-xl transition-shadow sm:px-4',
            scrolled ? 'shadow-soft' : 'shadow-sm',
          )}
        >
          <NavLink to="/dashboard" className="flex items-center gap-2 px-1.5">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-accent-coral to-accent-peach text-white shadow-glow"
            >
              <Sparkles size={17} />
            </motion.div>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-semibold leading-none tracking-tight">Campus</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Projets</p>
            </div>
          </NavLink>

          <nav className="ml-2 hidden flex-1 items-center gap-0.5 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'text-ink-900'
                      : 'text-ink-500 hover:text-ink-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="topnav-active"
                        className="absolute inset-0 rounded-xl bg-brand-100/70 ring-1 ring-brand-200/60"
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      />
                    )}
                    <l.icon size={15} className="relative" />
                    <span className="relative">{l.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold leading-tight text-ink-800">{profile?.full_name}</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-400">
                {profile?.role === 'supervisor' ? 'Encadrant' : 'Étudiant'}
              </p>
            </div>
            <button
              onClick={() => setMenu((v) => !v)}
              className="rounded-xl p-1 transition hover:bg-ink-100/60"
              aria-label="Compte"
            >
              <Avatar name={profile?.full_name} url={profile?.avatar_url} size={32} ring="brand" />
            </button>
            <button
              onClick={() => setDrawer(true)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100/60 text-ink-700 transition hover:bg-ink-200/70 md:hidden"
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>

          <AnimatePresence>
            {menu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-3 top-[60px] z-30 w-56 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-1.5 shadow-soft backdrop-blur-xl"
                >
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-100/70"
                  >
                    <LogOut size={15} />
                    Se déconnecter
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <AnimatePresence>
        {drawer && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-0 flex h-full w-72 flex-col gap-1.5 border-l border-white/70 bg-white/95 p-4 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-base font-semibold">Menu</p>
                <button
                  onClick={() => setDrawer(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100 text-ink-700"
                >
                  <X size={18} />
                </button>
              </div>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/dashboard'}
                  onClick={() => setDrawer(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm',
                      isActive
                        ? 'bg-brand-100/70 text-ink-900 ring-1 ring-brand-200/60'
                        : 'text-ink-600 hover:bg-ink-100/60',
                    )
                  }
                >
                  <l.icon size={16} />
                  {l.label}
                </NavLink>
              ))}
              <button
                onClick={handleSignOut}
                className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-100/60"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
