import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select, Label, FieldError } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  title: z.string().min(3, 'Titre requis (≥ 3 caractères)'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed']),
})

export default function ProjectForm({ defaultValues, onSubmit, submitLabel = 'Créer' }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input id="title" placeholder="Ex : Refonte du site associatif" {...register('title')} />
        <FieldError>{errors.title?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} placeholder="Objectifs, livrables attendus…" {...register('description')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="date" {...register('deadline')} />
        </div>
        <div>
          <Label htmlFor="status">Statut</Label>
          <Select id="status" {...register('status')}>
            <option value="draft">Brouillon</option>
            <option value="active">En cours</option>
            <option value="completed">Terminé</option>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
