import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { seedDemoData } from '@/lib/demoSeed'
import { toast } from '@/components/ui/Toast'
import { Sparkles } from 'lucide-react'
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { FolderKanban, CheckCircle2, FileBox, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { useMyProjects, useProjectsStats } from '@/hooks/useProjectsData'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Empty from '@/components/ui/Empty'
import Skeleton from '@/components/ui/Skeleton'
import { formatDate, daysUntil, projectStatus, cn } from '@/lib/utils'

export default function SupervisorDashboard() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const queryClient = useQueryClient()
  const [seeding, setSeeding] = useState(false)

  async function loadDemo() {
    if (!user?.id) return
    setSeeding(true)
    try {
      await seedDemoData(user.id)
      toast.success('Données de démo chargées')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['projects-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['deliverables-count'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-activity'] }),
      ])
    } catch (err) {
      toast.error(err.message ?? 'Impossible de charger la démo')
    } finally {
      setSeeding(false)
    }
  }

  const projectsQ = useMyProjects(user?.id, 'supervisor')
  const ids = projectsQ.data?.map((p) => p.id) ?? []
  const statsQ = useProjectsStats(ids)

  const deliverablesCountQ = useQuery({
    enabled: ids.length > 0,
    queryKey: ['deliverables-count', ids],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('deliverables')
        .select('id', { count: 'exact', head: true })
        .in('project_id', ids)
      if (error) throw error
      return count ?? 0
    },
  })

  const weeklyQ = useQuery({
    enabled: ids.length > 0,
    queryKey: ['weekly-activity', ids],
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - 42)
      const { data, error } = await supabase
        .from('tasks')
        .select('status, created_at')
        .in('project_id', ids)
        .gte('created_at', since.toISOString())
      if (error) throw error
      const buckets = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i * 7)
        const k = isoWeekKey(d)
        buckets[k] = { week: k, completed: 0, created: 0 }
      }
      for (const t of data ?? []) {
        const k = isoWeekKey(new Date(t.created_at))
        if (!buckets[k]) continue
        buckets[k].created += 1
        if (t.status === 'done') buckets[k].completed += 1
      }
      return Object.values(buckets)
    },
  })

  const summary = useMemo(() => {
    const projects = projectsQ.data?.length ?? 0
    const active = (projectsQ.data ?? []).filter((p) => p.status === 'active').length
    let totalTasks = 0
    let doneTasks = 0
    for (const s of Object.values(statsQ.data ?? {})) {
      totalTasks += s.total
      doneTasks += s.done
    }
    const overdue = (projectsQ.data ?? []).filter((p) => {
      if (!p.deadline || p.status === 'completed') return false
      return new Date(p.deadline) < new Date()
    }).length
    const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
    return { projects, active, totalTasks, doneTasks, overdue, pct }
  }, [projectsQ.data, statsQ.data])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Espace encadrant"
        title={`Bonjour ${profile?.full_name?.split(' ')[0] ?? ''}`}
        description="Vue d’ensemble de vos projets, équipes et livrables."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadDemo} loading={seeding}>
              <Sparkles size={16} /> Données de démo
            </Button>
            <Button to="/projects/new">
              <Plus size={16} /> Nouveau projet
            </Button>
          </div>
        }
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard icon={FolderKanban} label="Projets" value={summary.projects} hint={`${summary.active} actifs`} />
        <StatCard icon={CheckCircle2} label="Tâches terminées" value={`${summary.doneTasks}/${summary.totalTasks}`} accent="emerald" />
        <StatCard icon={FileBox} label="Livrables déposés" value={deliverablesCountQ.data ?? 0} />
        <StatCard icon={AlertTriangle} label="Projets en retard" value={summary.overdue} accent={summary.overdue ? 'rose' : 'slate'} />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle className="mb-4">Avancement global</CardTitle>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="65%"
                outerRadius="100%"
                data={[{ name: 'progress', value: summary.pct, fill: 'url(#radialGrad)' }]}
                startAngle={90}
                endAngle={-270}
              >
                <defs>
                  <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7c44ff" />
                    <stop offset="100%" stopColor="#ff6f91" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: 'rgba(124,68,255,0.08)' }} dataKey="value" cornerRadius={999} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-semibold text-ink-900">{summary.pct}%</p>
            <p className="text-xs text-ink-500">Tâches complétées sur l’ensemble</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Activité — 6 dernières semaines</CardTitle>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyQ.data ?? []}>
                <CartesianGrid stroke="rgba(15,17,40,0.06)" />
                <XAxis dataKey="week" stroke="#8d93ab" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8d93ab" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.96)',
                    border: '1px solid rgba(15,17,40,0.08)',
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: '0 8px 28px -16px rgba(60,30,140,0.18)',
                  }}
                  labelStyle={{ color: '#3f4566', fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#7c44ff"
                  strokeWidth={2.5}
                  dot={false}
                  name="Créées"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  name="Terminées"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">Tous les projets</h2>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Voir tous <ArrowUpRight size={14} />
          </Link>
        </div>

        {projectsQ.isLoading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (projectsQ.data ?? []).length === 0 ? (
          <Empty
            icon={FolderKanban}
            title="Aucun projet"
            description="Créez votre premier projet pour démarrer."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button to="/projects/new"><Plus size={16} /> Nouveau projet</Button>
                <Button variant="secondary" onClick={loadDemo} loading={seeding}>
                  <Sparkles size={16} /> Charger la démo
                </Button>
              </div>
            }
          />
        ) : (
          <Card className="!p-0">
            <table className="w-full">
              <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Avancement</th>
                  <th className="px-4 py-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 text-sm">
                {projectsQ.data.slice(0, 6).map((p) => {
                  const s = statsQ.data?.[p.id] ?? { total: 0, done: 0 }
                  const pct = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100)
                  const status = projectStatus(p.status)
                  const dleft = daysUntil(p.deadline)
                  return (
                    <tr key={p.id} className="transition hover:bg-ink-50/60">
                      <td className="px-4 py-3">
                        <Link
                          to={`/projects/${p.id}`}
                          className="font-medium text-ink-900 hover:text-brand-600"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={status.class}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-coral"
                            />
                          </div>
                          <span className="text-xs text-ink-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-ink-700">{formatDate(p.deadline)}</span>
                        {dleft !== null && p.status !== 'completed' && (
                          <span
                            className={cn(
                              'ml-2 text-xs',
                              dleft < 0 ? 'text-rose-600' : dleft <= 7 ? 'text-amber-600' : 'text-ink-400',
                            )}
                          >
                            {dleft < 0 ? `${-dleft} j retard` : `J-${dleft}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, hint, accent = 'brand' }) {
  const accents = {
    brand: 'from-brand-400 to-brand-600',
    emerald: 'from-emerald-400 to-emerald-600',
    rose: 'from-rose-400 to-rose-600',
    slate: 'from-ink-400 to-ink-600',
  }
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="surface relative overflow-hidden p-5"
    >
      <div className={cn('grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-glow', accents[accent])}>
        <Icon size={20} />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-ink-500">{label}</p>
      <p className="font-display text-3xl font-semibold text-ink-900">{value}</p>
      {hint && <p className="text-[11px] text-ink-500">{hint}</p>}
    </motion.div>
  )
}

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `S${String(weekNo).padStart(2, '0')}`
}
