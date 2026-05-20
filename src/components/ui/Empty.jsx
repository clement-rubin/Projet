import { motion } from 'framer-motion'

export default function Empty({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="surface flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      {Icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 via-accent-coral to-accent-peach text-white shadow-glow"
        >
          <Icon size={22} />
        </motion.div>
      )}
      <div>
        <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </motion.div>
  )
}
