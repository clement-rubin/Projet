import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession(session) {
    set({ session, user: session?.user ?? null })
  },

  async loadProfile() {
    const user = get().user
    if (!user) {
      set({ profile: null })
      return null
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle()
    if (error) {
      // eslint-disable-next-line no-console
      console.error('loadProfile', error)
    }
    set({ profile: data ?? null })
    return data ?? null
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ session: data.session, user: data.user })
    await get().loadProfile()
  },

  async signUp({ email, password, fullName, role }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    if (error) throw error
    if (data.session) {
      set({ session: data.session, user: data.user })
      await get().loadProfile()
    }
    return data
  },

  async signOut() {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },

  async init() {
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null })
    await get().loadProfile()
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (_evt, session) => {
      set({ session, user: session?.user ?? null })
      await get().loadProfile()
    })
  },
}))
