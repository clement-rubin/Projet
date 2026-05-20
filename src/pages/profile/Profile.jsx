import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input, Label, FieldError } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { toast } from '@/components/ui/Toast'

const schema = z.object({
  full_name: z.string().min(2, 'Nom complet requis'),
})

export default function Profile() {
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const loadProfile = useAuthStore((s) => s.loadProfile)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })

  async function onSubmit(values) {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: values.full_name })
      .eq('id', user.id)
    if (error) return toast.error(error.message)
    await loadProfile()
    toast.success('Profil mis à jour')
  }

  async function onAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (upErr && upErr.statusCode !== 404 && !upErr.message?.includes('Bucket not found')) throw upErr
      if (upErr) {
        toast.error('Bucket "avatars" manquant dans Supabase. Créez-le (public) pour activer cette fonction.')
        return
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      await loadProfile()
      toast.success('Avatar mis à jour')
    } catch (err) {
      toast.error(err.message ?? 'Upload impossible')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compte" title="Mon profil" description="Modifiez vos informations personnelles." />

      <Card className="max-w-2xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={profile?.full_name} url={profile?.avatar_url} size={72} />
            <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-gradient-to-br from-brand-500 to-accent-coral p-1.5 text-white shadow-glow transition hover:scale-110">
              <Camera size={14} />
              <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">{profile?.full_name}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              {profile?.role === 'supervisor' ? 'Encadrant' : 'Étudiant'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" {...register('full_name')} />
            <FieldError>{errors.full_name?.message}</FieldError>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
