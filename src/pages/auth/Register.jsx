import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GraduationCap, UserCog } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Input, Label, FieldError } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import AuthShell from './AuthShell'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Nom complet requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  role: z.enum(['student', 'supervisor']),
})

export default function Register() {
  const { session, signUp } = useAuthStore()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'student' } })

  const selectedRole = watch('role')

  if (session) return <Navigate to="/dashboard" replace />

  async function onSubmit(values) {
    setSubmitting(true)
    try {
      const data = await signUp(values)
      if (!data.session) {
        toast.success('Compte créé. Vérifiez votre email pour confirmer.')
        navigate('/login')
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      toast.error(err.message ?? 'Inscription impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Créez votre compte"
      subtitle="Choisissez votre rôle pour adapter votre espace de travail."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <RoleOption
            icon={GraduationCap}
            label="Étudiant"
            description="Membre d'équipe projet"
            active={selectedRole === 'student'}
            onClick={() => setValue('role', 'student', { shouldValidate: true })}
          />
          <RoleOption
            icon={UserCog}
            label="Encadrant"
            description="Suivi et évaluation"
            active={selectedRole === 'supervisor'}
            onClick={() => setValue('role', 'supervisor', { shouldValidate: true })}
          />
        </div>

        <div>
          <Label htmlFor="fullName">Nom complet</Label>
          <Input id="fullName" placeholder="Clément Hanne" {...register('fullName')} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@etablissement.fr"
            {...register('email')}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 6 caractères"
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Créer mon compte
        </Button>
      </form>
    </AuthShell>
  )
}

function RoleOption({ icon: Icon, label, description, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition',
        active
          ? 'border-brand-300 bg-gradient-to-br from-brand-50 to-brand-100/80 shadow-glow'
          : 'border-ink-200/70 bg-white/70 hover:border-brand-200 hover:bg-white',
      )}
    >
      <div
        className={cn(
          'grid h-9 w-9 place-items-center rounded-xl text-white shadow-soft',
          active
            ? 'bg-gradient-to-br from-brand-500 to-brand-700'
            : 'bg-gradient-to-br from-ink-300 to-ink-400',
        )}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
    </motion.button>
  )
}
