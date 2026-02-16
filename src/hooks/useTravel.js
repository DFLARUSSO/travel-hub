import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function useTravel() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()
  
  // Fetch richieste viaggi (proprie o tutte se admin/manager)
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['travel', user?.id, profile?.role],
    queryFn: async () => {
      let query = supabase
        .from('travel_requests')
        .select(`
          *,
          user:users!travel_requests_user_id_fkey(full_name, email),
          approver:users!travel_requests_approved_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
      
      // Se non admin/manager, mostra solo proprie richieste
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
    mutationFn: async (travelData) => {
      const { data, error } = await supabase
        .from('travel_requests')
        .insert([{
          user_id: user.id,
          destination: travelData.destination,
          departure_date: travelData.departureDate,
          return_date: travelData.returnDate,
          needs_flight: travelData.needsFlight,
          needs_train: travelData.needsTrain,
          needs_taxi: travelData.needsTaxi,
          needs_hotel: travelData.needsHotel,
          hotel_preferences: travelData.hotelPreferences || null,
          transport_preferences: travelData.transportPreferences || null,
          budget_estimate: travelData.budgetEstimate,
          purpose: travelData.purpose,
          status: 'pending',
        }])
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['travel'])
      toast.success('✅ Richiesta viaggio inviata! Attendi approvazione Manager.')
    },
    onError: (error) => {
      console.error('Error creating travel request:', error)
      toast.error('❌ Errore nell\'invio della richiesta')
    },
  })
  
  // Approva richiesta (admin/manager)
  const approveRequest = useMutation({
    mutationFn: async (requestId) => {
      const { data, error } = await supabase
        .from('travel_requests')
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
      queryClient.invalidateQueries(['travel'])
      toast.success('✅ Richiesta viaggio approvata!')
    },
    onError: () => {
      toast.error('❌ Errore nell\'approvazione')
    },
  })
  
  // Rifiuta richiesta (admin/manager)
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      const { data, error } = await supabase
        .from('travel_requests')
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
      queryClient.invalidateQueries(['travel'])
      toast.success('✅ Richiesta viaggio rifiutata')
    },
    onError: () => {
      toast.error('❌ Errore nel rifiuto')
    },
  })
  
  // Elimina richiesta (solo se pending e propria)
  const deleteRequest = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('travel_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['travel'])
      toast.success('✅ Richiesta eliminata')
    },
    onError: () => {
      toast.error('❌ Errore nell\'eliminazione')
    },
  })
  
  return {
    requests,
    isLoading,
    createRequest: createRequest.mutate,
    approveRequest: approveRequest.mutate,
    rejectRequest: rejectRequest.mutate,
    deleteRequest: deleteRequest.mutate,
    isCreating: createRequest.isPending,
  }
}
