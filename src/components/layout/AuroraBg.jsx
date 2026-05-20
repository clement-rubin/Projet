import { motion } from 'framer-motion'

export default function AuroraBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 30, -10, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-accent-coral/40 to-brand-400/40 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[-10rem] top-32 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-accent-aqua/45 to-brand-300/45 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, -15, 0], y: [0, -15, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-12rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-brand-300/45 to-accent-peach/40 blur-3xl"
      />
    </div>
  )
}
