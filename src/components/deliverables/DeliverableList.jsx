import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'

export default function DeliverableList({ items, isSupervisor, onChange }) {
  const userId = useAuthStore((s) => s.user?.id)

  async function remove(item) {
    const { error } = await supabase.from('deliverables').delete().eq('id', item.id)
    if (error) return toast.error(error.message)
    toast.info('Livrable supprimé')
    onChange?.()
  }

  if (!items?.length) {
    return (
      <p className="rounded-2xl border border-dashed border-ink-200 bg-white/40 px-4 py-6 text-center text-sm text-ink-500">
        Aucun livrable pour le moment.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence>
        {items.map((d) => {
          const canDelete = isSupervisor || d.uploaded_by === userId
          return (
            <motion.li
              key={d.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-coral text-white shadow-glow">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{d.title}</p>
                <p className="text-xs text-ink-500">
                  Déposé le {formatDate(d.created_at)} · {d.profiles?.full_name ?? 'Inconnu'}
                </p>
              </div>
              <a
                href={d.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <Download size={13} /> Télécharger
              </a>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(d)}
                  aria-label="Supprimer"
                >
                  <Trash2 size={15} className="text-rose-500" />
                </Button>
              )}
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
