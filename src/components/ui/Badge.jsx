import { cn } from '@/lib/utils'

export default function Badge({ className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
