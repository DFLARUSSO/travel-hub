// src/pages/Dashboard.jsx
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/common/Card'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Users, Building2, Plane, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'

export function Dashboard() {
  const { profile } = useAuthStore()
  const { data: stats, isLoading: loading, error } = useDashboardStats()

  // 🐛 DEBUG TEMPORANEO
  console.log('=== DASHBOARD DEBUG ===')
  console.log('Profile:', profile)
  console.log('Stats:', stats)
  console.log('Loading:', loading)
  console.log('Error:', error)

  const isAdmin = profile?.role === 'admin'
  const isManager = profile?.role === 'manager'

  const quickStats = [
    {
      name: 'Presenze questo mese',
      value: loading ? '...' : stats?.presences?.thisMonth || '0',
      icon: Calendar,
      color: 'text-calendar-office',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: `Dal ${format(startOfMonth(new Date()), 'd MMM', { locale: it })}`
    },
    {
      name: 'Giorni in ufficio',
      value: loading ? '...' : stats?.presences?.office || '0',
      icon: Building2,
      color: 'text-calendar-office',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Questo mese'
    },
    {
      name: 'Giorni in smart working',
      value: loading ? '...' : stats?.presences?.remote || '0',
      icon: Users,
      color: 'text-calendar-remote',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'Questo mese'
    },
    {
      name: 'Richieste in sospeso',
      value: loading ? '...' : stats?.pending?.total || '0',
      icon: Clock,
      color: 'text-status-warning',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      description: 'Da approvare'
    },
  ]

  // Stats aggiuntive per Admin/Manager
  const adminStats = (isAdmin || isManager) ? [
    {
      name: 'Viaggi da approvare',
      value: loading ? '...' : stats?.pending?.travels || '0',
      icon: Plane,
      color: 'text-status-warning',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      name: 'Foresteria da approvare',
      value: loading ? '...' : stats?.pending?.foresteria || '0',
      icon: Building2,
      color: 'text-status-warning',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Totale dipendenti',
      value: loading ? '...' : stats?.users?.total || '0',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    },
    {
      name: 'Presenze oggi',
      value: loading ? '...' : stats?.presences?.today || '0',
      icon: CheckCircle,
      color: 'text-status-success',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ] : []

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Benvenuto, {profile?.full_name || profile?.email}!
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
            Ecco un riepilogo delle tue attività
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {stat.value}
                  </p>
                  {stat.description && (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Admin/Manager Stats */}
        {(isAdmin || isManager) && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Statistiche Aziendali
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {adminStats.map((stat) => (
                <Card key={stat.name} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prossimi Viaggi */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center">
              <Plane className="h-5 w-5 mr-2" />
              Prossimi Viaggi
            </h3>
            {loading ? (
              <p className="text-text-secondary-light dark:text-text-secondary-dark">Caricamento...</p>
            ) : stats?.upcoming?.travels && stats.upcoming.travels.length > 0 ? (
              <div className="space-y-3">
                {stats.upcoming.travels.map((travel) => (
                  <div key={travel.id} className="flex justify-between items-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                        {travel.destination}
                      </p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {format(new Date(travel.departure_date), 'd MMM', { locale: it })} - {format(new Date(travel.return_date), 'd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                    <span className={`badge ${
                      travel.status === 'approved' ? 'badge-approved' :
                      travel.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                    }`}>
                      {travel.status === 'approved' ? 'Approvato' :
                       travel.status === 'rejected' ? 'Rifiutato' : 'In attesa'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary-light dark:text-text-secondary-dark">Nessuna trasferta pianificata</p>
            )}
          </Card>

          {/* Prenotazioni Foresteria */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Foresteria
            </h3>
            {loading ? (
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Caricamento...</p>
              ) : stats?.upcoming?.foresteria && stats.upcoming.foresteria.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcoming.foresteria.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
                      <div>
                        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                          {booking.nights} {booking.nights === 1 ? 'notte' : 'notti'}
                        </p>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          {/* Usa check_in e check_out invece di checkin/checkout */}
                          {format(new Date(booking.check_in), 'd MMM', { locale: it })} - {format(new Date(booking.check_out), 'd MMM yyyy', { locale: it })}
                        </p>
                      </div>
                      <span className={`badge ${
                        booking.status === 'approved' ? 'badge-approved' :
                        booking.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                      }`}>
                        {booking.status === 'approved' ? 'Approvato' :
                        booking.status === 'rejected' ? 'Rifiutato' : 'In attesa'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Nessuna prenotazione attiva</p>
              )}
          </Card>
        </div>
      </div>
    </div>
  )
}
