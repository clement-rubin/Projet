import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMyProjects(userId, role) {
  return useQuery({
    enabled: !!userId && !!role,
    queryKey: ['my-projects', userId, role],
    queryFn: async () => {
      if (role === 'supervisor') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return data ?? []
      }
      const { data, error } = await supabase
        .from('project_members')
        .select('project:projects(*)')
        .eq('user_id', userId)
      if (error) throw error
      return (data ?? []).map((r) => r.project).filter(Boolean)
    },
  })
}

export function useProjectsStats(projectIds) {
  return useQuery({
    enabled: projectIds?.length > 0,
    queryKey: ['projects-stats', projectIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('project_id, status')
        .in('project_id', projectIds)
      if (error) throw error
      const map = {}
      for (const t of data ?? []) {
        const s = (map[t.project_id] ??= { total: 0, done: 0 })
        s.total += 1
        if (t.status === 'done') s.done += 1
      }
      return map
    },
  })
}

export function useProjectMembers(projectIds) {
  return useQuery({
    enabled: projectIds?.length > 0,
    queryKey: ['projects-members', projectIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('project_id, profile:profiles(id, full_name, avatar_url)')
        .in('project_id', projectIds)
      if (error) throw error
      const map = {}
      for (const r of data ?? []) {
        const arr = map[r.project_id] ?? (map[r.project_id] = [])
        arr.push(r.profile)
      }
      return map
    },
  })
}
