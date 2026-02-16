import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function useForesteria() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()
  
  // Fetch richieste foresteria (proprie o tutte se admin/manager)
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['foresteria', user?.id, profile?.role],
    queryFn: async () => {
      let query = supabase
        .from('foresteria_requests')
        .select(`
          *,
          user:users!foresteria_requests_user_id_fkey(full_name, email),
          approver:users!foresteria_requests_approved_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
      
      // Se non admin, mostra solo proprie richieste
      if (profile?.role !== 'admin' && profile?.role !== 'manager') {
        query = query.eq('user_id', user.id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
    enabled: !!user && !!profile,
  })
  
  // Crea nuova richiesta
  const createRequest = useMutation({
    mutationFn: async ({ checkIn, checkOut, notes }) => {
      const { data, error } = await supabase
        .from('foresteria_requests')
        .insert([{
          user_id: user.id,
          check_in: checkIn,
          check_out: checkOut,
          notes: notes || null,
          status: 'pending',
        }])
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foresteria'])
      toast.success('✅ Richiesta inviata con successo! Attendi approvazione HR.')
    },
    onError: (error) => {
      console.error('Error creating request:', error)
      toast.error('❌ Errore nell\'invio della richiesta')
    },
  })
  
  // Approva richiesta (solo admin)
  const approveRequest = useMutation({
    mutationFn: async (requestId) => {
      const { data, error } = await supabase
        .from('foresteria_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foresteria'])
      toast.success('✅ Richiesta approvata!')
    },
    onError: () => {
      toast.error('❌ Errore nell\'approvazione')
    },
  })
  
  // Rifiuta richiesta (solo admin)
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      const { data, error } = await supabase
        .from('foresteria_requests')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', requestId)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foresteria'])
      toast.success('✅ Richiesta rifiutata')
    },
    onError: () => {
      toast.error('❌ Errore nel rifiuto')
    },
  })
  
  // Elimina richiesta (solo se pending e propria)
  const deleteRequest = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('foresteria_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foresteria'])
      toast.success('✅ Richiesta eliminata')
    },
    onError: () => {
      toast.error('❌ Errore nell\'eliminazione')
    },
  })
  
  // Calcola disponibilità per un periodo
  const checkAvailability = async (checkIn, checkOut) => {
    const { data, error } = await supabase.rpc('check_foresteria_availability', {
      p_check_in: checkIn,
      p_check_out: checkOut,
    })
    
    if (error) {
      console.error('Error checking availability:', error)
      return 3 // Default: tutti disponibili in caso di errore
    }
    
    return data || 3
  }
  
  return {
    requests,
    isLoading,
    createRequest: createRequest.mutate,
    approveRequest: approveRequest.mutate,
    rejectRequest: rejectRequest.mutate,
    deleteRequest: deleteRequest.mutate,
    checkAvailability,
    isCreating: createRequest.isPending,
  }
}
