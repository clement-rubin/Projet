import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ListChecks } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { AvatarStack } from '@/components/ui/Avatar'
import { formatDate, daysUntil, projectStatus, truncate } from '@/lib/utils'

export default function ProjectCard({ project, members = [], stats }) {
  const status = projectStatus(project.status)
  const dleft = daysUntil(project.deadline)
  const total = stats?.total ?? 0
  const done = stats?.done ?? 0
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card hover className="h-full">
        <span className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-brand-300/40 to-accent-coral/40 blur-2xl" />
        <CardHeader>
          <div className="min-w-0">
            <CardTitle className="truncate">{project.title}</CardTitle>
            <CardDescription className="mt-1">
              {truncate(project.description, 110) || 'Pas de description'}
            </CardDescription>
          </div>
          <Badge className={status.class}>{status.label}</Badge>
        </CardHeader>

        <div className="relative mt-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks size={13} /> {done}/{total} tâches
              </span>
              <span className="font-semibold text-ink-800">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-accent-coral to-accent-peach"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <CalendarDays size={13} />
              <span>{formatDate(project.deadline)}</span>
              {dleft !== null && project.status !== 'completed' && (
                <span
                  className={
                    dleft < 0
                      ? 'text-rose-600'
                      : dleft <= 7
                        ? 'text-amber-600'
                        : 'text-ink-400'
                  }
                >
                  · {dleft < 0 ? `${-dleft} j retard` : `J-${dleft}`}
                </span>
              )}
            </div>
            <AvatarStack users={members} size={24} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
