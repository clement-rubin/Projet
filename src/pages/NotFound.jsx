import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-300/45 via-accent-coral/40 to-accent-peach/45 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-5"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Erreur 404</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-ink-900">
          <span className="text-gradient">Page introuvable.</span>
        </h1>
        <p className="mx-auto max-w-sm text-sm text-ink-500">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Button to="/dashboard">Retour au tableau de bord</Button>
      </motion.div>
    </div>
  )
}
