import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import ProjectForm from '@/components/projects/ProjectForm'
import { toast } from '@/components/ui/Toast'

export default function ProjectCreate() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  async function onSubmit(values) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: values.title,
        description: values.description || null,
        deadline: values.deadline || null,
        status: values.status,
        supervisor_id: user.id,
      })
      .select()
      .single()
    if (error) return toast.error(error.message)
    toast.success('Projet créé')
    navigate(`/projects/${data.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nouveau"
        title="Créer un projet"
        description="Décrivez votre projet. Vous pourrez ajouter les étudiants depuis la page du projet."
      />
      <Card className="max-w-2xl">
        <ProjectForm onSubmit={onSubmit} submitLabel="Créer le projet" />
      </Card>
    </div>
  )
}
