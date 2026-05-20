import { initials, cn } from '@/lib/utils'

const RING = {
  default: 'ring-2 ring-white',
  brand: 'ring-2 ring-white shadow-glow',
  none: '',
}

export default function Avatar({ name, url, size = 32, className, ring = 'default' }) {
  const dim = { width: size, height: size }
  if (url) {
    return (
      <img
        src={url}
        alt={name ?? ''}
        style={dim}
        className={cn('rounded-full object-cover', RING[ring], className)}
      />
    )
  }
  return (
    <div
      style={dim}
      className={cn(
        'grid place-items-center rounded-full bg-gradient-to-br from-brand-400 via-accent-coral to-accent-peach text-[11px] font-semibold text-white',
        RING[ring],
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}

export function AvatarStack({ users, max = 4, size = 26 }) {
  const shown = users?.slice(0, max) ?? []
  const extra = (users?.length ?? 0) - shown.length
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => (
        <Avatar key={u.id} name={u.full_name} url={u.avatar_url} size={size} />
      ))}
      {extra > 0 && (
        <div
          style={{ width: size, height: size }}
          className="grid place-items-center rounded-full bg-ink-100/90 text-[10px] font-semibold text-ink-700 ring-2 ring-white"
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
