import { supabase } from './supabase'

const DEMO_PROJECTS = [
  {
    title: 'Refonte du site associatif',
    description:
      'Repenser l\'identité visuelle et le parcours utilisateur du site de l\'association des étudiants.',
    statusOffsetDays: 28,
    status: 'active',
    tasks: [
      { title: 'Audit ergonomique de l\'existant', status: 'done' },
      { title: 'Moodboard et direction artistique', status: 'done' },
      { title: 'Maquettes haute-fidélité (Figma)', status: 'in_progress', dueIn: 5 },
      { title: 'Intégration page d\'accueil', status: 'in_progress', dueIn: 8 },
      { title: 'Page actualités + CMS', status: 'review', dueIn: 3 },
      { title: 'Recettage cross-browser', status: 'todo', dueIn: 18 },
      { title: 'Mise en production OVH', status: 'todo', dueIn: 25 },
    ],
  },
  {
    title: 'Étude IoT — capteurs qualité de l\'air',
    description:
      'Prototype d\'un réseau de capteurs basé sur ESP32 pour mesurer la qualité de l\'air dans les salles de cours.',
    statusOffsetDays: 56,
    status: 'active',
    tasks: [
      { title: 'État de l\'art capteurs SDS011/PMS5003', status: 'done' },
      { title: 'Schéma électronique et BOM', status: 'done' },
      { title: 'Firmware MQTT + Wi-Fi', status: 'in_progress', dueIn: 6 },
      { title: 'Dashboard Grafana', status: 'in_progress', dueIn: 10 },
      { title: 'Calibration capteurs', status: 'todo', dueIn: 14 },
      { title: 'Étude statistique sur 2 semaines', status: 'todo', dueIn: 30 },
      { title: 'Rapport final et soutenance', status: 'todo', dueIn: 45 },
    ],
  },
  {
    title: 'App mobile bibliothèque universitaire',
    description:
      'Application React Native pour réserver des créneaux en salle de travail et consulter le catalogue.',
    statusOffsetDays: -10,
    status: 'draft',
    tasks: [
      { title: 'Spécifications fonctionnelles', status: 'in_progress', dueIn: 4 },
      { title: 'Wireframes parcours principal', status: 'todo', dueIn: 9 },
      { title: 'API : choix backend & endpoints', status: 'todo', dueIn: 12 },
    ],
  },
]

function dateIn(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function seedDemoData(userId) {
  for (const p of DEMO_PROJECTS) {
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .insert({
        title: p.title,
        description: p.description,
        deadline: dateIn(p.statusOffsetDays),
        status: p.status,
        supervisor_id: userId,
      })
      .select()
      .single()
    if (pErr) throw pErr

    const tasks = p.tasks.map((t) => ({
      project_id: project.id,
      title: t.title,
      status: t.status,
      due_date: t.dueIn !== undefined ? dateIn(t.dueIn) : null,
      created_by: userId,
    }))
    const { error: tErr } = await supabase.from('tasks').insert(tasks)
    if (tErr) throw tErr
  }
}
