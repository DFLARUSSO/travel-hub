import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import itLocale from '@fullcalendar/core/locales/it'
import { format, eachDayOfInterval, parseISO } from 'date-fns'

export function ForesteriaCalendar({ requests = [], onDateSelect }) {
  // Calcola occupazione per ogni giorno
  const getDayOccupancy = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const occupied = requests.filter(req => 
      req.status === 'approved' &&
      dateStr >= req.check_in &&
      dateStr < req.check_out // check_out è escluso (giorno partenza)
    ).length
    
    return Math.min(occupied, 3) // Max 3
  }
  
  // Crea eventi per visualizzare prenotazioni
  const events = []
  
  requests.forEach(request => {
    if (request.status === 'approved') {
      // Per ogni giorno del periodo, aggiungi un "background event"
      const days = eachDayOfInterval({
        start: parseISO(request.check_in),
        end: parseISO(request.check_out),
      })
      
      // Rimuovi l'ultimo giorno (check-out)
      days.pop()
      
      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const occupancy = getDayOccupancy(day)
        
        let color, title
        if (occupancy === 3) {
          color = '#EF4444' // Rosso - pieno
          title = '🔴 Pieno (3/3)'
        } else if (occupancy === 2) {
          color = '#F59E0B' // Arancio - quasi pieno
          title = '🟡 1 posto (2/3)'
        } else if (occupancy === 1) {
          color = '#10B981' // Verde - disponibile
          title = '🟢 2 posti (1/3)'
        } else {
          color = '#10B981' // Verde - tutto libero
          title = '🟢 3 posti'
        }
        
        events.push({
          id: `${request.id}-${dateStr}`,
          title,
          date: dateStr,
          backgroundColor: color,
          borderColor: color,
          display: 'background',
          extendedProps: {
            occupancy,
            request,
          }
        })
      })
    }
  })
  
  // Aggiungi eventi visibili per le prenotazioni
  requests.forEach(request => {
    if (request.status === 'approved') {
      events.push({
        id: request.id,
        title: `${request.user?.full_name?.split(' ')[0] || 'Utente'}`,
        start: request.check_in,
        end: request.check_out,
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        textColor: 'white',
        extendedProps: {
          request,
        }
      })
    }
  })
  
  const handleDateClick = (info) => {
    const occupancy = getDayOccupancy(info.date)
    const available = 3 - occupancy
    
    if (onDateSelect) {
      onDateSelect({
        date: info.dateStr,
        available,
        occupancy,
      })
    }
  }
  
  return (
    <div className="foresteria-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={itLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        buttonText={{
          today: 'Oggi',
          month: 'Mese',
        }}
        events={events}
        dateClick={handleDateClick}
        height="auto"
        editable={false}
        selectable={false}
        dayMaxEvents={2}
        weekends={true}
        firstDay={1}
        eventDisplay="block"
      />
      
      {/* Legenda */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-6 h-6 rounded bg-status-success flex-shrink-0" />
          <div>
            <div className="font-semibold text-status-success">Disponibile</div>
            <div className="text-text-secondary-light dark:text-text-secondary-dark">1-3 posti liberi</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="w-6 h-6 rounded bg-status-warning flex-shrink-0" />
          <div>
            <div className="font-semibold text-status-warning">Quasi pieno</div>
            <div className="text-text-secondary-light dark:text-text-secondary-dark">1 posto libero</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="w-6 h-6 rounded bg-status-error flex-shrink-0" />
          <div>
            <div className="font-semibold text-status-error">Tutto occupato</div>
            <div className="text-text-secondary-light dark:text-text-secondary-dark">0 posti liberi</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
        💡 <strong>Tip:</strong> Click su una data per vedere la disponibilità e creare una richiesta
      </div>
      
      
    </div>
  )
}
