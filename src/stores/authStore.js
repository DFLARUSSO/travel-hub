import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  
  setProfile: (profile) => set({ profile }),
  
  setLoading: (loading) => set({ loading }),
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    set({ user: data.user, profile })
    return data
  },
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
  
  initialize: async () => {
    set({ loading: true })
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      set({ user: session.user, profile })
    }
    
    set({ loading: false })
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        set({ user: session.user, profile })
      } else {
        set({ user: null, profile: null })
      }
    })
  },
}))
