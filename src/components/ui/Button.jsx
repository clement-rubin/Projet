import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 shadow-glow disabled:opacity-60',
  secondary:
    'bg-white/80 text-ink-800 hover:bg-white border border-ink-200/70 backdrop-blur shadow-sm disabled:opacity-60',
  ghost: 'text-ink-600 hover:text-ink-900 hover:bg-ink-100/60',
  danger: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:from-rose-500 hover:to-rose-500 shadow-soft',
  outline: 'border border-ink-200/70 text-ink-800 hover:bg-white/70',
}

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-xl',
  md: 'h-10 px-4 text-sm rounded-2xl',
  lg: 'h-12 px-6 text-base rounded-2xl',
  icon: 'h-9 w-9 rounded-xl',
}

const MotionLink = motion(Link)

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, loading, disabled, to, children, ...rest },
  ref,
) {
  const classes = cn(
    'group relative inline-flex select-none items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  )

  const motionProps = {
    whileTap: { scale: disabled || loading ? 1 : 0.96 },
    whileHover: { y: disabled || loading ? 0 : -1 },
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
  }

  if (to) {
    return (
      <MotionLink ref={ref} to={to} className={classes} {...motionProps} {...rest}>
        <Sheen />
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...motionProps}
      {...rest}
    >
      <Sheen />
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  )
})

function Sheen() {
  return (
    <span className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[inherit]">
      <span className="absolute -inset-x-2 -top-10 h-20 -translate-x-full bg-sheen opacity-70 transition-transform duration-700 ease-out group-hover:translate-x-full" />
    </span>
  )
}

export default Button
