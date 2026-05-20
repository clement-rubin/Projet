import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, FolderKanban } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { useMyProjects, useProjectsStats, useProjectMembers } from '@/hooks/useProjectsData'
import PageHeader from '@/components/layout/PageHeader'
import ProjectCard from '@/components/projects/ProjectCard'
import Empty from '@/components/ui/Empty'
import Skeleton from '@/components/ui/Skeleton'
import { Card, CardTitle } from '@/components/ui/Card'
import { formatDate, daysUntil, taskStatus, cn } from '@/lib/utils'

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  const projectsQ = useMyProjects(user?.id, 'student')
  const ids = projectsQ.data?.map((p) => p.id) ?? []
  const statsQ = useProjectsStats(ids)
  const membersQ = useProjectMembers(ids)

  const tasksQ = useQuery({
    enabled: !!user?.id,
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(title)')
        .eq('assigned_to', user.id)
        .neq('status', 'done')
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(8)
      if (error) throw error
      return data ?? []
    },
  })

  const stats = useMemo(() => {
    const projects = projectsQ.data?.length ?? 0
    let totalTasks = 0
    let doneTasks = 0
    for (const s of Object.values(statsQ.data ?? {})) {
      totalTasks += s.total
      doneTasks += s.done
    }
    return { projects, totalTasks, doneTasks }
  }, [projectsQ.data, statsQ.data])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Espace étudiant"
        title={`Bonjour ${profile?.full_name?.split(' ')[0] ?? ''} 👋`}
        description="Voici vos projets et les tâches qui vous attendent aujourd’hui."
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard icon={FolderKanban} label="Projets actifs" value={stats.projects} />
        <StatCard icon={CheckCircle2} label="Tâches terminées" value={stats.doneTasks} accent />
        <StatCard
          icon={Clock}
          label="Tâches en cours"
          value={stats.totalTasks - stats.doneTasks}
        />
      </motion.div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">Mes projets</h2>
        {projectsQ.isLoading ? (
          <GridSkeleton n={3} />
        ) : (projectsQ.data ?? []).length === 0 ? (
          <Empty
            icon={FolderKanban}
            title="Aucun projet pour le moment"
            description="Votre encadrant doit vous ajouter à un projet pour qu’il apparaisse ici."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {projectsQ.data.map((p) => (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProjectCard project={p} members={membersQ.data?.[p.id] ?? []} stats={statsQ.data?.[p.id]} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">À traiter</h2>
        <Card className="!p-0">
          {tasksQ.isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (tasksQ.data ?? []).length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-500">
              Aucune tâche assignée. Profitez-en !
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {tasksQ.data.map((t) => {
                const st = taskStatus(t.status)
                const dleft = daysUntil(t.due_date)
                return (
                  <li key={t.id} className="flex items-center gap-4 px-4 py-3 transition hover:bg-ink-50/60">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px]', st.class)}>
                      {st.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{t.title}</p>
                      <p className="truncate text-xs text-ink-500">{t.project?.title}</p>
                    </div>
                    <div className="text-right text-xs text-ink-500">
                      <p>{formatDate(t.due_date)}</p>
                      {dleft !== null && (
                        <p
                          className={
                            dleft < 0
                              ? 'text-rose-600'
                              : dleft <= 3
                                ? 'text-amber-600'
                                : 'text-ink-400'
                          }
                        >
                          {dleft < 0 ? `${-dleft} j retard` : `J-${dleft}`}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="surface flex items-center gap-4 p-5"
    >
      <div
        className={cn(
          'grid h-11 w-11 place-items-center rounded-2xl text-white shadow-glow bg-gradient-to-br',
          accent ? 'from-emerald-400 to-emerald-600' : 'from-brand-400 to-brand-600',
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-500">{label}</p>
        <p className="font-display text-3xl font-semibold text-ink-900">{value}</p>
      </div>
    </motion.div>
  )
}

function GridSkeleton({ n }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>
  )
}
