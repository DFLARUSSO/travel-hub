// src/hooks/usePresences.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function usePresences() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Fetch presenze
  const { data: presences = [], isLoading, error } = useQuery({
    queryKey: ['presences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presences')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  // Crea presenza singola o sovrascrive esistente
  const createPresence = useMutation({
    mutationFn: async ({ date, locationType, clientName, notes, overwrite, existingId }) => {
      if (overwrite && existingId) {
        // Aggiorna presenza esistente
        const { data, error } = await supabase
          .from('presences')
          .update({
            location_type: locationType,
            client_name: clientName || null,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId)
          .select()

        if (error) throw error
        return data
      } else {
        // Crea nuova presenza
        const { data, error } = await supabase
          .from('presences')
          .insert([{
            user_id: user.id,
            date,
            location_type: locationType,
            client_name: clientName || null,
            notes: notes || null,
          }])
          .select()

        if (error) throw error
        return data
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['presences'])
      if (variables.overwrite) {
        toast.success('✅ Presenza aggiornata con successo!')
      } else {
        toast.success('✅ Presenza registrata con successo!')
      }
    },
    onError: (error) => {
      console.error('Error creating presence:', error)
      if (error.message.includes('unique_user_date')) {
        toast.error('⚠️ Presenza già registrata per questa data')
      } else {
        toast.error('❌ Errore nel salvataggio della presenza')
      }
    },
  })

  // Crea presenze multiple (periodo) con gestione sovrascrittura
  const createPresences = useMutation({
    mutationFn: async ({ dates, locationType, clientName, notes, overwriteAll }) => {
      if (overwriteAll) {
        // Sovrascrivi tutte le presenze esistenti
        const results = []
        for (const date of dates) {
          // Cerca presenza esistente
          const { data: existing } = await supabase
            .from('presences')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', date)
            .single()

          if (existing) {
            // Aggiorna esistente
            const { data, error } = await supabase
              .from('presences')
              .update({
                location_type: locationType,
                client_name: clientName || null,
                notes: notes || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
              .select()

            if (error) throw error
            results.push(...(data || []))
          } else {
            // Crea nuovo
            const { data, error } = await supabase
              .from('presences')
              .insert([{
                user_id: user.id,
                date,
                location_type: locationType,
                client_name: clientName || null,
                notes: notes || null,
              }])
              .select()

            if (error) throw error
            results.push(...(data || []))
          }
        }
        return results
      } else {
        // Inserisci solo nuove date (senza sovrascrittura)
        const presencesToInsert = dates.map(date => ({
          user_id: user.id,
          date,
          location_type: locationType,
          client_name: clientName || null,
          notes: notes || null,
        }))

        const { data, error } = await supabase
          .from('presences')
          .insert(presencesToInsert)
          .select()

        if (error) throw error
        return data
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['presences'])
      toast.success(`✅ ${data.length} presenze registrate con successo!`)
    },
    onError: (error) => {
      console.error('Error creating presences:', error)
      if (error.message.includes('unique_user_date')) {
        toast.error('⚠️ Alcune date risultano già registrate')
      } else {
        toast.error('❌ Errore nel salvataggio delle presenze')
      }
    },
  })

  // Aggiorna presenza
  const updatePresence = useMutation({
    mutationFn: async (updates) => {
      const { id, ...fields } = updates
      const { data, error } = await supabase
        .from('presences')
        .update(fields)
        .eq('id', id)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['presences'])
      toast.success('✅ Presenza aggiornata!')
    },
    onError: () => {
      toast.error('❌ Errore nell\'aggiornamento')
    },
  })

  // Elimina presenza
  const deletePresence = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('presences')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['presences'])
      toast.success('✅ Presenza eliminata')
    },
    onError: () => {
      toast.error('❌ Errore nell\'eliminazione')
    },
  })

  // Helper: trova presenza per data
  const getPresenceByDate = (date) => {
    return presences.find(p => p.date === date)
  }

  return {
    presences,
    isLoading,
    error,
    createPresence: createPresence.mutate,
    createPresences: createPresences.mutate,
    updatePresence: updatePresence.mutate,
    deletePresence: deletePresence.mutate,
    getPresenceByDate,
    isCreating: createPresence.isPending || createPresences.isPending,
  }
}
