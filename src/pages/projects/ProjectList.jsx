import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, FolderKanban } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMyProjects, useProjectsStats, useProjectMembers } from '@/hooks/useProjectsData'
import PageHeader from '@/components/layout/PageHeader'
import ProjectCard from '@/components/projects/ProjectCard'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Empty from '@/components/ui/Empty'
import Skeleton from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'active', label: 'En cours' },
  { id: 'draft', label: 'Brouillon' },
  { id: 'completed', label: 'Terminés' },
]

export default function ProjectList() {
  const user = useAuthStore((s) => s.user)
  const projectsQ = useMyProjects(user?.id, 'supervisor')
  const ids = projectsQ.data?.map((p) => p.id) ?? []
  const statsQ = useProjectsStats(ids)
  const membersQ = useProjectMembers(ids)

  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    let arr = projectsQ.data ?? []
    if (filter !== 'all') arr = arr.filter((p) => p.status === filter)
    if (q.trim()) {
      const needle = q.toLowerCase()
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          (p.description ?? '').toLowerCase().includes(needle),
      )
    }
    return arr
  }, [projectsQ.data, filter, q])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestion"
        title="Projets"
        description="Créez et suivez l’ensemble de vos projets étudiants."
        actions={
          <Button to="/projects/new">
            <Plus size={16} /> Nouveau projet
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Rechercher un projet…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                filter === f.id
                  ? 'border-brand-300 bg-brand-100/80 text-brand-700 shadow-sm'
                  : 'border-ink-200/70 bg-white/70 text-ink-500 hover:border-brand-200 hover:text-ink-900',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {projectsQ.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          icon={FolderKanban}
          title={q || filter !== 'all' ? 'Aucun résultat' : 'Aucun projet'}
          description={
            q || filter !== 'all'
              ? 'Modifiez vos filtres ou la recherche.'
              : 'Démarrez en créant votre premier projet.'
          }
          action={
            <Button to="/projects/new">
              <Plus size={16} /> Nouveau projet
            </Button>
          }
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <ProjectCard project={p} stats={statsQ.data?.[p.id]} members={membersQ.data?.[p.id] ?? []} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
