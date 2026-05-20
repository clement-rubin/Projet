import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Card({ className, hover = false, tint = false, as = 'div', ...rest }) {
  const Cmp = motion[as] ?? motion.div
  return (
    <Cmp
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        tint ? 'surface-tint' : 'surface',
        'relative overflow-hidden p-5 transition-shadow',
        hover && 'cursor-pointer hover:shadow-glow',
        className,
      )}
      {...rest}
    />
  )
}

export function CardHeader({ className, ...rest }) {
  return <div className={cn('mb-3 flex items-start justify-between gap-3', className)} {...rest} />
}

export function CardTitle({ className, ...rest }) {
  return (
    <h3
      className={cn('text-base font-semibold tracking-tight text-ink-900', className)}
      {...rest}
    />
  )
}

export function CardDescription({ className, ...rest }) {
  return <p className={cn('text-sm text-ink-500', className)} {...rest} />
}
