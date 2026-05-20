import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export default function UploadZone({ projectId, onUploaded }) {
  const user = useAuthStore((s) => s.user)
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file) {
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${projectId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('deliverables')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw upErr

      const { data: signed, error: signErr } = await supabase.storage
        .from('deliverables')
        .createSignedUrl(path, 60 * 60 * 24 * 365)
      if (signErr) throw signErr

      const { error: insErr } = await supabase.from('deliverables').insert({
        project_id: projectId,
        title: file.name,
        file_url: signed.signedUrl,
        file_name: file.name,
        uploaded_by: user.id,
      })
      if (insErr) throw insErr

      toast.success('Livrable déposé')
      onUploaded?.()
    } catch (err) {
      toast.error(err.message ?? 'Upload impossible')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
      }}
      onClick={() => inputRef.current?.click()}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition',
        dragging
          ? 'border-brand-400 bg-gradient-to-br from-brand-50/80 to-accent-coral/10'
          : 'border-ink-200 bg-white/60 hover:border-brand-300 hover:bg-brand-50/40',
      )}
    >
      <motion.div
        animate={uploading ? { scale: [1, 1.05, 1] } : { y: [0, -4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 via-accent-coral to-accent-peach text-white shadow-glow"
      >
        {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
      </motion.div>
      <p className="text-sm font-semibold text-ink-900">
        {uploading ? 'Envoi en cours…' : 'Glissez un fichier ou cliquez pour parcourir'}
      </p>
      <p className="text-xs text-ink-500">Le fichier est partagé avec l’équipe et l’encadrant.</p>
      <input ref={inputRef} type="file" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
    </motion.div>
  )
}
