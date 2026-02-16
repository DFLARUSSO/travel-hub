// src/hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useUsers() {
  const queryClient = useQueryClient()

  // Fetch all users
  const { data: users, isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  // Create user
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      // Prima crea l'utente in auth.users (Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (authError) throw authError

      // Poi inserisci nella tabella public.users
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          department: userData.department,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Utente creato con successo')
    },
    onError: (error) => {
      console.error('Error creating user:', error)
      toast.error('Errore durante la creazione dell\'utente')
    },
  })

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }) => {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Utente aggiornato con successo')
    },
    onError: (error) => {
      console.error('Error updating user:', error)
      toast.error('Errore durante l\'aggiornamento dell\'utente')
    },
  })

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      // Prima elimina da public.users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) throw deleteError

      // Poi elimina da auth.users (richiede permessi admin)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) console.warn('Could not delete auth user:', authError)
      
      return userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Utente eliminato con successo')
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      toast.error('Errore durante l\'eliminazione dell\'utente')
    },
  })

  return {
    users,
    loading,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
  }
}
