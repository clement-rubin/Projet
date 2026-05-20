import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Input, Label, FieldError } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import AuthShell from './AuthShell'
import { toast } from '@/components/ui/Toast'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

export default function Login() {
  const { session, signIn } = useAuthStore()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  if (session) return <Navigate to="/dashboard" replace />

  async function onSubmit(values) {
    setSubmitting(true)
    try {
      await signIn(values.email, values.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message ?? 'Identifiants invalides')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Connexion"
      title="Heureux de vous revoir."
      subtitle="Connectez-vous pour retrouver vos projets, vos équipes et vos livrables."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Se connecter
        </Button>
      </form>
    </AuthShell>
  )
}
