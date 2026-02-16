// src/hooks/useDashboardStats.js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { startOfMonth, endOfMonth } from 'date-fns'

export function useDashboardStats() {
  const { user, profile } = useAuthStore()

  return useQuery({
    queryKey: ['dashboard-stats', user?.id, profile?.role],
    queryFn: async () => {
      if (!user || !profile) return null

      const userId = user.id
      const isAdmin = profile.role === 'admin'
      const isManager = profile.role === 'manager'
      
      const today = new Date()
      const monthStart = startOfMonth(today).toISOString().split('T')[0]
      const monthEnd = endOfMonth(today).toISOString().split('T')[0]
      const todayStr = today.toISOString().split('T')[0]

      try {
        // 1. Statistiche Presenze del mese corrente
        const { data: presences, error: presencesError } = await supabase
          .from('presences')
          .select('*')
          .eq('user_id', userId)
          .gte('date', monthStart)
          .lte('date', monthEnd)

        if (presencesError) {
          console.error('Presences error:', presencesError)
          throw presencesError
        }

        const presenceStats = {
          thisMonth: presences?.length || 0,
          office: presences?.filter(p => p.location_type === 'office').length || 0,
          remote: presences?.filter(p => p.location_type === 'remote').length || 0,
          client: presences?.filter(p => p.location_type === 'client').length || 0,
        }

        // 2. Presenze oggi (per admin/manager)
        if (isAdmin || isManager) {
          const { data: todayPresences } = await supabase
            .from('presences')
            .select('id')
            .eq('date', todayStr)
          
          presenceStats.today = todayPresences?.length || 0
        }

        // 3. Richieste in sospeso dell'utente
        const { data: pendingTravels } = await supabase
          .from('travel_requests')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'pending')

        const { data: pendingForesteria } = await supabase
          .from('foresteria_requests')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'pending')

        // 4. Prossimi viaggi approvati dell'utente
        const { data: upcomingTravels } = await supabase
          .from('travel_requests')
          .select('id, destination, departure_date, return_date, status')
          .eq('user_id', userId)
          .gte('departure_date', todayStr)
          .order('departure_date', { ascending: true })
          .limit(3)

        // 5. Prossime prenotazioni foresteria dell'utente
        const { data: upcomingForesteria } = await supabase
          .from('foresteria_requests')
          .select('id, check_in, check_out, status')
          .eq('user_id', userId)
          .gte('check_in', todayStr)
          .order('check_in', { ascending: true })
          .limit(3)

        // 6. Statistiche Admin/Manager
        let adminData = {
          pendingTravelsAdmin: 0,
          pendingForesteriaAdmin: 0,
          totalUsers: 0,
        }

        if (isAdmin || isManager) {
          // Viaggi da approvare (Manager e Admin)
          const { count: pendingTravelsCount } = await supabase
            .from('travel_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')

          adminData.pendingTravelsAdmin = pendingTravelsCount || 0

          // Foresteria da approvare (solo Admin)
          if (isAdmin) {
            const { count: pendingForesteriaCount } = await supabase
              .from('foresteria_requests')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'pending')

            adminData.pendingForesteriaAdmin = pendingForesteriaCount || 0
          }

          // Totale utenti
          const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

          adminData.totalUsers = totalUsers || 0
        }

        return {
          presences: presenceStats,
          pending: {
            total: (pendingTravels?.length || 0) + (pendingForesteria?.length || 0),
            travels: isAdmin || isManager ? adminData.pendingTravelsAdmin : (pendingTravels?.length || 0),
            foresteria: isAdmin || isManager ? adminData.pendingForesteriaAdmin : (pendingForesteria?.length || 0),
          },
          upcoming: {
            travels: upcomingTravels || [],
            foresteria: upcomingForesteria?.map(f => ({
              ...f,
              // Calcola notti usando i nomi corretti delle colonne
              nights: Math.ceil((new Date(f.check_out) - new Date(f.check_in)) / (1000 * 60 * 60 * 24)),
              // Rinomina per compatibilità con Dashboard
              checkin: f.check_in,
              checkout: f.check_out
            })) || [],
          },
          users: isAdmin || isManager ? { total: adminData.totalUsers } : null,
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
      }
    },
    enabled: !!user && !!profile,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  })
}
