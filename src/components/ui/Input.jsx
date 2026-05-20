import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-2xl border border-ink-200/70 bg-white/80 px-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-sm transition focus:border-brand-400 focus:bg-white focus:shadow-ring disabled:opacity-60'

export const Input = forwardRef(function Input({ className, type = 'text', ...rest }, ref) {
  return <input ref={ref} type={type} className={cn(base, 'h-11', className)} {...rest} />
})

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(base, 'py-2.5', className)} {...rest} />
})

export const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cn(base, 'h-11', className)} {...rest}>
      {children}
    </select>
  )
})

export function Label({ className, ...rest }) {
  return (
    <label
      className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500', className)}
      {...rest}
    />
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-rose-500">{children}</p>
}
