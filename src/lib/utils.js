import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return dateFmt.format(d)
}

export function daysUntil(value) {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

const PROJECT_STATUS = {
  draft: { label: 'Brouillon', class: 'border-ink-200 bg-ink-100/70 text-ink-700' },
  active: { label: 'En cours', class: 'border-brand-200 bg-brand-100/70 text-brand-700' },
  completed: { label: 'Terminé', class: 'border-emerald-200 bg-emerald-100/70 text-emerald-700' },
}

const TASK_STATUS = {
  todo: { label: 'À faire', class: 'border-ink-200 bg-ink-100/70 text-ink-700' },
  in_progress: { label: 'En cours', class: 'border-amber-200 bg-amber-100/70 text-amber-700' },
  review: { label: 'Révision', class: 'border-sky-200 bg-sky-100/70 text-sky-700' },
  done: { label: 'Terminé', class: 'border-emerald-200 bg-emerald-100/70 text-emerald-700' },
}

export function projectStatus(s) {
  return PROJECT_STATUS[s] ?? PROJECT_STATUS.draft
}
export function taskStatus(s) {
  return TASK_STATUS[s] ?? TASK_STATUS.todo
}

export const TASK_COLUMNS = [
  { id: 'todo', label: 'À faire' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'review', label: 'En révision' },
  { id: 'done', label: 'Terminé' },
]

export function truncate(s, n = 80) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
