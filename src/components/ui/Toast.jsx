import { AnimatePresence, motion } from 'framer-motion'
import { create } from 'zustand'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const useToastStore = create((set) => ({
  toasts: [],
  push(t) {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, t.duration ?? 4200)
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
  },
}))

export const toast = {
  success: (message, opts) => useToastStore.getState().push({ type: 'success', message, ...opts }),
  error: (message, opts) => useToastStore.getState().push({ type: 'error', message, ...opts }),
  info: (message, opts) => useToastStore.getState().push({ type: 'info', message, ...opts }),
}

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-rose-500" />,
  info: <Info size={18} className="text-sky-500" />,
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-soft backdrop-blur"
          >
            <div className="mt-0.5">{ICONS[t.type] ?? ICONS.info}</div>
            <p className="flex-1 text-sm text-ink-800">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
