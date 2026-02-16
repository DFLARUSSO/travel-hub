import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { PresenceCalendar } from '@/components/modules/presences/PresenceCalendar'
import { PresenceModal } from '@/components/modules/presences/PresenceModal'
import { usePresences } from '@/hooks/usePresences'
import { Plus, Download } from 'lucide-react'

export function Presenze() {
  const { 
    presences, 
    isLoading, 
    createPresence, 
    createPresences, 
    updatePresence,
    deletePresence,
    getPresenceByDate 
  } = usePresences()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPresence, setSelectedPresence] = useState(null)
  const [existingPresenceForDate, setExistingPresenceForDate] = useState(null)
  
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr
    const existingPresence = getPresenceByDate(clickedDate)
    
    setSelectedDate(clickedDate)
    setSelectedPresence(null)
    setExistingPresenceForDate(existingPresence || null)
    setIsModalOpen(true)
  }
  
  const handleEventClick = (info) => {
    const presence = presences.find(p => p.id === info.event.id)
    if (presence) {
      setSelectedPresence(presence)
      setSelectedDate(null)
      setExistingPresenceForDate(null)
      setIsModalOpen(true)
    }
  }
  /*
  const handleSubmit = (data) => {
    if (data.dates) {
      createPresences({
        dates: data.dates,
        locationType: data.locationType,
        clientName: data.clientName,
        notes: data.notes,
      })
    } else {
      createPresence({
        date: data.date,
        locationType: data.locationType,
        clientName: data.clientName,
        notes: data.notes,
        overwrite: data.overwrite,
        existingId: data.existingId,
      })
    }
  }*/

  const handleSubmit = (data) => {
    if (data.dates) {
      // Periodo multiplo
      createPresences(data)
    } else {
      // Singola data
      createPresence(data)
    }
  }
  
  const handleUpdate = (updates) => {
    updatePresence(updates)
  }
  
  const handleDelete = (id) => {
    deletePresence(id)
  }
  
  const handleExport = () => {
    alert('Export Excel in sviluppo!')
  }
  
  const stats = {
    total: presences.length,
    office: presences.filter(p => p.location_type === 'office').length,
    remote: presences.filter(p => p.location_type === 'remote').length,
    client: presences.filter(p => p.location_type === 'client').length,
  }
  
  return (
    <div>
      <Header title="Presenze" />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDate(null)
              setSelectedPresence(null)
              setExistingPresenceForDate(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Registra Presenza
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={20} />
            Esporta Excel
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Presenze totali
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="text-3xl font-bold text-calendar-office">{stats.office}</div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              🏢 In ufficio
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="text-3xl font-bold text-calendar-remote">{stats.remote}</div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              🏠 Smart working
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="text-3xl font-bold text-calendar-client">{stats.client}</div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              🤝 Dal cliente
            </div>
          </Card>
        </div>
        
        {/* Calendar */}
        <Card title="Calendario Presenze">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Caricamento presenze...
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                💡 <strong>Clicca su una data</strong> per registrare una nuova presenza, oppure <strong>clicca su un evento</strong> per modificarlo
              </p>
              <PresenceCalendar
                presences={presences}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            </>
          )}
        </Card>
      </div>
      
      {/* Modal */}
      <PresenceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDate(null)
          setSelectedPresence(null)
        }}
        onSubmit={handleSubmit}
        selectedDate={selectedDate}
        presence={selectedPresence}
        onUpdate={updatePresence}  // ← Passa updatePresence
        onDelete={deletePresence}  // ← Passa deletePresence
        getPresenceByDate={getPresenceByDate}
      />
    </div>
  )
}
