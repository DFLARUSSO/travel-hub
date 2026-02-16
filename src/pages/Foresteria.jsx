import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ForesteriaModal } from '@/components/modules/foresteria/ForesteriaModal'
import { ForesteriaCalendar } from '@/components/modules/foresteria/ForesteriaCalendar'
import { useForesteria } from '@/hooks/useForesteria'
import { useAuthStore } from '@/stores/authStore'
import { Plus, CheckCircle, XCircle, Clock, Trash2, Calendar as CalendarIcon, List } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export function Foresteria() {
  const { profile } = useAuthStore()
  const { 
    requests, 
    isLoading, 
    createRequest, 
    approveRequest, 
    rejectRequest,
    deleteRequest 
  } = useForesteria()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [viewMode, setViewMode] = useState('calendar')
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableSpots, setAvailableSpots] = useState(3)
  
  const handleSubmit = (data) => {
    createRequest({
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      notes: data.notes,
    })
  }
  
  const handleApprove = (requestId) => {
    if (window.confirm('Confermi l\'approvazione di questa richiesta?')) {
      approveRequest(requestId)
    }
  }
  
  const handleReject = (requestId) => {
    const reason = prompt('Motivo del rifiuto:')
    if (reason) {
      rejectRequest({ requestId, reason })
    }
  }
  
  const handleDelete = (requestId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa richiesta?')) {
      deleteRequest(requestId)
    }
  }
  
  const handleDateSelect = (info) => {
    const clickedDate = info.date
    const today = format(new Date(), 'yyyy-MM-dd')
    
    // Non permettere date passate
    if (clickedDate < today) {
      alert('Non puoi creare richieste per date passate')
      return
    }
    
    // Controlla se l'utente ha già una richiesta per questo periodo
    const hasExistingRequest = requests.some(req => {
      if (req.user_id !== profile?.id) return false
      if (req.status === 'rejected') return false
      return clickedDate >= req.check_in && clickedDate < req.check_out
    })
    
    if (hasExistingRequest) {
      alert('Hai già una richiesta che include questa data. Controlla le tue prenotazioni.')
      return
    }
    
    // Precompila la data e passa disponibilità
    setSelectedDate(clickedDate)
    setAvailableSpots(info.available)
    setSelectedRequest(null)
    setIsModalOpen(true)
  }
  
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')
  
  const isAdminOrHR = profile?.role === 'admin'
  
  return (
    <div>
      <Header title="Foresteria" />
      
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestione Foresteria</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                🏠 3 posti letto disponibili • Approvazione richiesta da HR/Admin
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-primary text-white'
                      : 'bg-transparent hover:bg-surface-light dark:hover:bg-surface-dark'
                  }`}
                >
                  <CalendarIcon size={16} />
                  Calendario
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors border-l border-border-light dark:border-border-dark ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-transparent hover:bg-surface-light dark:hover:bg-surface-dark'
                  }`}
                >
                  <List size={16} />
                  Lista
                </button>
              </div>
              
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedDate(null)
                  setAvailableSpots(3)
                  setSelectedRequest(null)
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Nuova Richiesta
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="text-status-warning" size={24} />
              <div className="text-3xl font-bold text-status-warning">{pendingRequests.length}</div>
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              In attesa
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="text-status-success" size={24} />
              <div className="text-3xl font-bold text-status-success">{approvedRequests.length}</div>
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Approvate
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="text-status-error" size={24} />
              <div className="text-3xl font-bold text-status-error">{rejectedRequests.length}</div>
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Rifiutate
            </div>
          </Card>
        </div>
        
        {viewMode === 'calendar' && (
          <Card title="📅 Calendario Occupazione" className="mb-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Caricamento calendario...
                </p>
              </div>
            ) : (
              <ForesteriaCalendar
                requests={requests}
                onDateSelect={handleDateSelect}
              />
            )}
          </Card>
        )}
        
        {isAdminOrHR && pendingRequests.length > 0 && (
          <Card title="🔔 Richieste da Approvare" className="mb-6">
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{request.user?.full_name}</p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {request.user?.email}
                      </p>
                    </div>
                    <span className="badge badge-pending">In Attesa</span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm">
                      📅 <strong>Check-in:</strong> {format(new Date(request.check_in), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <p className="text-sm">
                      📅 <strong>Check-out:</strong> {format(new Date(request.check_out), 'dd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                  
                  {request.notes && (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3 p-2 bg-surface-light dark:bg-background-dark rounded">
                      💬 {request.notes}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Approva
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-status-error"
                    >
                      <XCircle size={16} />
                      Rifiuta
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {viewMode === 'list' && (
          <Card title={isAdminOrHR ? "Tutte le Richieste" : "Le Mie Richieste"}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Caricamento richieste...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Nessuna richiesta presente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {isAdminOrHR && (
                        <div>
                          <p className="font-semibold">{request.user?.full_name}</p>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {request.user?.email}
                          </p>
                        </div>
                      )}
                      {!isAdminOrHR && (
                        <p className="font-semibold">Richiesta Foresteria</p>
                      )}
                      <span className={`badge ${
                        request.status === 'pending' ? 'badge-pending' :
                        request.status === 'approved' ? 'badge-approved' :
                        'badge-rejected'
                      }`}>
                        {request.status === 'pending' ? 'In Attesa' :
                         request.status === 'approved' ? 'Approvata' :
                         'Rifiutata'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm">
                        📅 <strong>Check-in:</strong> {format(new Date(request.check_in), 'dd MMM yyyy', { locale: it })}
                      </p>
                      <p className="text-sm">
                        📅 <strong>Check-out:</strong> {format(new Date(request.check_out), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                    
                    {request.notes && (
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2 p-2 bg-surface-light dark:bg-background-dark rounded">
                        💬 {request.notes}
                      </p>
                    )}
                    
                    {request.status === 'rejected' && request.rejection_reason && (
                      <p className="text-sm text-status-error mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        ❌ Motivo rifiuto: {request.rejection_reason}
                      </p>
                    )}
                    
                    {request.status === 'approved' && request.approver && (
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        ✅ Approvata da {request.approver.full_name}
                      </p>
                    )}
                    
                    {!isAdminOrHR && request.status === 'pending' && (
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(request.id)}
                          className="flex items-center gap-1 text-status-error"
                        >
                          <Trash2 size={14} />
                          Elimina Richiesta
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
      
      <ForesteriaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDate(null)
          setAvailableSpots(3)
          setSelectedRequest(null)
        }}
        onSubmit={handleSubmit}
        selectedDate={selectedDate}
        availability={availableSpots}
        existingRequest={selectedRequest}
      />
    </div>
  )
}
