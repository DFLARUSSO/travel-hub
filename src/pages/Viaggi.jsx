import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { TravelModal } from '@/components/modules/travel/TravelModal'
import { useTravel } from '@/hooks/useTravel'
import { useAuthStore } from '@/stores/authStore'
import { Plus, CheckCircle, XCircle, Clock, Trash2, Plane, Train, Car, Hotel } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export function Viaggi() {
  const { profile } = useAuthStore()
  const { 
    requests, 
    isLoading, 
    createRequest, 
    approveRequest, 
    rejectRequest,
    deleteRequest 
  } = useTravel()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  
  const handleSubmit = (data) => {
    createRequest(data)
  }
  
  const handleApprove = (requestId) => {
    if (window.confirm('Confermi l\'approvazione di questa richiesta viaggio?')) {
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
  
  // Filtra richieste per status
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')
  
  const isManagerOrAdmin = profile?.role === 'admin' || profile?.role === 'manager'
  
  // Helper per mostrare servizi richiesti
  const renderServices = (request) => {
    const services = []
    if (request.needs_flight) services.push(<Plane key="flight" size={16} className="inline" title="Aereo" />)
    if (request.needs_train) services.push(<Train key="train" size={16} className="inline" title="Treno" />)
    if (request.needs_taxi) services.push(<Car key="taxi" size={16} className="inline" title="Taxi" />)
    if (request.needs_hotel) services.push(<Hotel key="hotel" size={16} className="inline" title="Hotel" />)
    return <div className="flex gap-2">{services}</div>
  }
  
  return (
    <div>
      <Header title="Viaggi" />
      
      <div className="p-8">
        {/* Header Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestione Viaggi Aziendali</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                ✈️ Richieste di trasferta • Approvazione richiesta da Manager
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
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
        
        {/* Stats Cards */}
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
        
        {/* Richieste in Attesa (per Manager/Admin) */}
        {isManagerOrAdmin && pendingRequests.length > 0 && (
          <Card title="🔔 Richieste da Approvare" className="mb-6">
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg">{request.destination}</p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {request.user?.full_name} • {request.user?.email}
                      </p>
                    </div>
                    <span className="badge badge-pending">In Attesa</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-sm">
                        📅 <strong>Partenza:</strong> {format(new Date(request.departure_date), 'dd MMM yyyy', { locale: it })}
                      </p>
                      <p className="text-sm">
                        📅 <strong>Ritorno:</strong> {format(new Date(request.return_date), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1"><strong>Servizi richiesti:</strong></p>
                      {renderServices(request)}
                    </div>
                  </div>
                  
                  {request.budget_estimate && (
                    <p className="text-sm mb-2">
                      💰 <strong>Budget:</strong> €{parseFloat(request.budget_estimate).toFixed(2)}
                    </p>
                  )}
                  
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3 p-2 bg-surface-light dark:bg-background-dark rounded">
                    💬 <strong>Motivo:</strong> {request.purpose}
                  </p>
                  
                  {request.hotel_preferences && (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
                      🏨 {request.hotel_preferences}
                    </p>
                  )}
                  
                  {request.transport_preferences && (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
                      🚆 {request.transport_preferences}
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
        
        {/* Tutte le Richieste */}
        <Card title={isManagerOrAdmin ? "Tutte le Richieste" : "Le Mie Richieste"}>
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
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg">{request.destination}</p>
                      {isManagerOrAdmin && (
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          {request.user?.full_name}
                        </p>
                      )}
                    </div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-sm">
                        📅 <strong>Partenza:</strong> {format(new Date(request.departure_date), 'dd MMM yyyy', { locale: it })}
                      </p>
                      <p className="text-sm">
                        📅 <strong>Ritorno:</strong> {format(new Date(request.return_date), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1"><strong>Servizi:</strong></p>
                      {renderServices(request)}
                    </div>
                  </div>
                  
                  {request.budget_estimate && (
                    <p className="text-sm mb-2">
                      💰 <strong>Budget:</strong> €{parseFloat(request.budget_estimate).toFixed(2)}
                    </p>
                  )}
                  
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2 p-2 bg-surface-light dark:bg-background-dark rounded">
                    💬 {request.purpose}
                  </p>
                  
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
                  
                  {/* Azioni per dipendente */}
                  {!isManagerOrAdmin && request.status === 'pending' && (
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
      </div>
      
      {/* Modal */}
      <TravelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRequest(null)
        }}
        onSubmit={handleSubmit}
        existingRequest={selectedRequest}
      />
    </div>
  )
}
