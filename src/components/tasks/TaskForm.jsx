import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select, Label, FieldError } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  title: z.string().min(2, 'Titre requis'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
})

export default function TaskForm({ defaultValues, members = [], onSubmit, submitLabel = 'Créer' }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'todo', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input id="title" placeholder="Ex : Maquette page d’accueil" {...register('title')} />
        <FieldError>{errors.title?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register('description')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="assigned_to">Assigné à</Label>
          <Select id="assigned_to" {...register('assigned_to')}>
            <option value="">Personne</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="due_date">Échéance</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="status">Statut</Label>
          <Select id="status" {...register('status')}>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="review">En révision</option>
            <option value="done">Terminé</option>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
