import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { toast } from '@/components/ui/Toast'

export default function MembersPanel({ projectId, isSupervisor, members, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2 || !isSupervisor) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .ilike('full_name', `%${query}%`)
        .eq('role', 'student')
        .limit(8)
      setResults(data ?? [])
      setSearching(false)
    }, 250)
    return () => clearTimeout(t)
  }, [query, isSupervisor])

  async function addMember(userId) {
    const { error } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: userId })
    if (error) return toast.error(error.message)
    toast.success('Étudiant ajouté à l’équipe')
    setQuery('')
    setResults([])
    onChange?.()
  }

  async function removeMember(userId) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
    if (error) return toast.error(error.message)
    toast.info('Étudiant retiré de l’équipe')
    onChange?.()
  }

  return (
    <div className="space-y-4">
      {isSupervisor && (
        <div className="relative">
          <div className="relative">
            <UserPlus
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un étudiant par nom…"
              className="pl-9"
            />
          </div>
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-soft backdrop-blur"
              >
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => addMember(r.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-brand-50/70"
                  >
                    <Avatar name={r.full_name} url={r.avatar_url} size={26} />
                    <span className="flex-1 truncate text-ink-800">{r.full_name}</span>
                    <span className="text-xs font-medium text-brand-600">Ajouter</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {searching && <p className="mt-2 text-xs text-ink-400">Recherche…</p>}
        </div>
      )}

      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white/60">
        {members.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-ink-400">Aucun membre pour le moment</li>
        )}
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={m.full_name} url={m.avatar_url} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{m.full_name}</p>
              <p className="text-xs text-ink-500">Étudiant</p>
            </div>
            {isSupervisor && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMember(m.id)}
                aria-label="Retirer"
              >
                <Trash2 size={15} className="text-rose-500" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
