import { cn } from '@/lib/utils'

export default function Skeleton({ className, ...rest }) {
  return <div className={cn('skeleton h-4 w-full', className)} {...rest} />
}
