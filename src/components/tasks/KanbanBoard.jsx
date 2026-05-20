import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { TASK_COLUMNS, formatDate, daysUntil, cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TaskForm from './TaskForm'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'

const COLUMN_TINTS = {
  todo: 'from-ink-100/70 to-ink-50/60',
  in_progress: 'from-amber-100/70 to-amber-50/60',
  review: 'from-sky-100/70 to-sky-50/60',
  done: 'from-emerald-100/70 to-emerald-50/60',
}

export default function KanbanBoard({ projectId, tasks, members, onChange }) {
  const user = useAuthStore((s) => s.user)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [localTasks, setLocalTasks] = useState(tasks ?? [])

  useEffect(() => setLocalTasks(tasks ?? []), [tasks])

  useEffect(() => {
    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        () => onChange?.(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, onChange])

  const columns = useMemo(() => {
    const map = Object.fromEntries(TASK_COLUMNS.map((c) => [c.id, []]))
    for (const t of localTasks) {
      ;(map[t.status] ?? map.todo).push(t)
    }
    return map
  }, [localTasks])

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination || destination.droppableId === source.droppableId) return

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: destination.droppableId } : t)),
    )

    const { error } = await supabase
      .from('tasks')
      .update({ status: destination.droppableId })
      .eq('id', draggableId)
    if (error) {
      toast.error('Mise à jour impossible')
      onChange?.()
    }
  }

  async function createTask(values) {
    const payload = {
      project_id: projectId,
      title: values.title,
      description: values.description || null,
      status: values.status,
      assigned_to: values.assigned_to || null,
      due_date: values.due_date || null,
      created_by: user.id,
    }
    const { error } = await supabase.from('tasks').insert(payload)
    if (error) return toast.error(error.message)
    setCreateOpen(false)
    toast.success('Tâche créée')
    onChange?.()
  }

  async function updateTask(values) {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: values.title,
        description: values.description || null,
        status: values.status,
        assigned_to: values.assigned_to || null,
        due_date: values.due_date || null,
      })
      .eq('id', editTask.id)
    if (error) return toast.error(error.message)
    setEditTask(null)
    toast.success('Tâche mise à jour')
    onChange?.()
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.info('Tâche supprimée')
    onChange?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">Tableau Kanban</h3>
          <p className="text-xs text-ink-500">
            Glissez-déposez pour modifier le statut. Sync temps réel.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={16} /> Nouvelle tâche
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TASK_COLUMNS.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex h-full min-h-[280px] flex-col gap-3 rounded-2xl border border-white/70 bg-gradient-to-b p-3 transition shadow-sm',
                    COLUMN_TINTS[col.id],
                    snapshot.isDraggingOver && 'ring-2 ring-brand-300 ring-offset-2 ring-offset-transparent',
                  )}
                >
                  <div className="flex items-center justify-between px-1 pb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                      {col.label}
                    </p>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-ink-600 shadow-sm">
                      {columns[col.id]?.length ?? 0}
                    </span>
                  </div>
                  <AnimatePresence>
                    {(columns[col.id] ?? []).map((t, idx) => (
                      <Draggable draggableId={t.id} index={idx} key={t.id}>
                        {(p, snap) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            style={{
                              ...p.draggableProps.style,
                              boxShadow: snap.isDragging
                                ? '0 18px 40px -16px rgba(124,68,255,0.4)'
                                : undefined,
                            }}
                            className={cn(
                              'group rounded-2xl border border-white/80 bg-white/90 p-3 backdrop-blur shadow-card transition',
                              snap.isDragging && 'border-brand-300',
                            )}
                          >
                            <TaskCard
                              task={t}
                              members={members}
                              onEdit={() => setEditTask(t)}
                              onDelete={() => deleteTask(t.id)}
                            />
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle tâche">
        <TaskForm members={members} onSubmit={createTask} submitLabel="Créer la tâche" />
      </Modal>
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Modifier la tâche">
        {editTask && (
          <TaskForm
            members={members}
            defaultValues={{
              title: editTask.title,
              description: editTask.description ?? '',
              status: editTask.status,
              assigned_to: editTask.assigned_to ?? '',
              due_date: editTask.due_date ?? '',
            }}
            onSubmit={updateTask}
            submitLabel="Enregistrer"
          />
        )}
      </Modal>
    </div>
  )
}

function TaskCard({ task, members, onEdit, onDelete }) {
  const assignee = members.find((m) => m.id === task.assigned_to)
  const dleft = daysUntil(task.due_date)
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-ink-900">{task.title}</p>
        <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="Modifier"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-ink-500">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {assignee ? (
            <Avatar name={assignee.full_name} url={assignee.avatar_url} size={22} />
          ) : (
            <span className="text-[11px] text-ink-400">Non assignée</span>
          )}
          {task.due_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px]',
                dleft !== null && dleft < 0 && task.status !== 'done'
                  ? 'text-rose-600'
                  : dleft !== null && dleft <= 3 && task.status !== 'done'
                    ? 'text-amber-600'
                    : 'text-ink-500',
              )}
            >
              <CalendarDays size={11} /> {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
