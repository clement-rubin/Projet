import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Pencil, Users, FileBox, ArrowLeft, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import MembersPanel from '@/components/projects/MembersPanel'
import UploadZone from '@/components/deliverables/UploadZone'
import DeliverableList from '@/components/deliverables/DeliverableList'
import ProjectForm from '@/components/projects/ProjectForm'
import { projectStatus, formatDate, daysUntil, cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const projectQ = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })

  const membersQ = useQuery({
    queryKey: ['project-members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('profile:profiles(id, full_name, avatar_url, role)')
        .eq('project_id', id)
      if (error) throw error
      return (data ?? []).map((r) => r.profile).filter(Boolean)
    },
  })

  const tasksQ = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const deliverablesQ = useQuery({
    queryKey: ['project-deliverables', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*, profiles:profiles(full_name)')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  if (projectQ.isLoading) return <Skeleton className="h-96 rounded-2xl" />
  if (projectQ.error || !projectQ.data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-sm text-rose-700">
        Projet introuvable ou accès refusé.
      </div>
    )
  }

  const project = projectQ.data
  const isSupervisor = project.supervisor_id === user.id
  const status = projectStatus(project.status)
  const dleft = daysUntil(project.deadline)

  async function deleteProject() {
    if (!confirm('Supprimer ce projet et toutes ses données ? Cette action est irréversible.')) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (error) return toast.error(error.message)
    toast.info('Projet supprimé')
    navigate('/projects')
  }

  async function saveProject(values) {
    const { error } = await supabase
      .from('projects')
      .update({
        title: values.title,
        description: values.description || null,
        deadline: values.deadline || null,
        status: values.status,
      })
      .eq('id', project.id)
    if (error) return toast.error(error.message)
    setEditOpen(false)
    toast.success('Projet mis à jour')
    queryClient.invalidateQueries({ queryKey: ['project', id] })
  }

  function refreshTasks() {
    queryClient.invalidateQueries({ queryKey: ['project-tasks', id] })
  }

  function refreshMembers() {
    queryClient.invalidateQueries({ queryKey: ['project-members', id] })
  }

  function refreshDeliverables() {
    queryClient.invalidateQueries({ queryKey: ['project-deliverables', id] })
  }

  const taskStats = (tasksQ.data ?? []).reduce(
    (acc, t) => {
      acc.total += 1
      if (t.status === 'done') acc.done += 1
      return acc
    },
    { total: 0, done: 0 },
  )
  const pct = taskStats.total === 0 ? 0 : Math.round((taskStats.done / taskStats.total) * 100)

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft size={14} /> Retour
      </button>

      <PageHeader
        eyebrow="Projet"
        title={project.title}
        description={project.description}
        actions={
          isSupervisor ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Modifier
              </Button>
              <Button variant="ghost" size="sm" onClick={deleteProject}>
                <Trash2 size={14} className="text-rose-500" />
              </Button>
            </div>
          ) : null
        }
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-4"
      >
        <Stat label="Statut" value={<Badge className={status.class}>{status.label}</Badge>} />
        <Stat
          label="Deadline"
          value={
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-ink-400" />
              <span className="text-ink-900">{formatDate(project.deadline)}</span>
              {dleft !== null && project.status !== 'completed' && (
                <span
                  className={cn(
                    'text-xs',
                    dleft < 0 ? 'text-rose-600' : dleft <= 7 ? 'text-amber-600' : 'text-ink-400',
                  )}
                >
                  {dleft < 0 ? `${-dleft} j retard` : `J-${dleft}`}
                </span>
              )}
            </div>
          }
        />
        <Stat label="Avancement" value={
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-accent-coral to-accent-peach"
              />
            </div>
            <span className="text-xs text-ink-600">{pct}%</span>
          </div>
        } />
        <Stat label="Équipe" value={
          <div className="inline-flex items-center gap-2">
            <Users size={16} className="text-ink-400" />
            <span className="text-ink-900">{membersQ.data?.length ?? 0} étudiants</span>
          </div>
        } />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <KanbanBoard
            projectId={project.id}
            tasks={tasksQ.data ?? []}
            members={membersQ.data ?? []}
            onChange={refreshTasks}
          />
        </Card>

        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Users size={16} /> Équipe
            </CardTitle>
            <MembersPanel
              projectId={project.id}
              isSupervisor={isSupervisor}
              members={membersQ.data ?? []}
              onChange={refreshMembers}
            />
          </Card>

          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <FileBox size={16} /> Livrables
            </CardTitle>
            <div className="space-y-3">
              <UploadZone projectId={project.id} onUploaded={refreshDeliverables} />
              <DeliverableList
                items={deliverablesQ.data ?? []}
                isSupervisor={isSupervisor}
                onChange={refreshDeliverables}
              />
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier le projet">
        <ProjectForm
          defaultValues={{
            title: project.title,
            description: project.description ?? '',
            deadline: project.deadline ?? '',
            status: project.status,
          }}
          onSubmit={saveProject}
          submitLabel="Enregistrer"
        />
      </Modal>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="surface p-4"
    >
      <p className="text-xs uppercase tracking-wider text-ink-500">{label}</p>
      <div className="mt-1.5 text-sm">{value}</div>
    </motion.div>
  )
}
