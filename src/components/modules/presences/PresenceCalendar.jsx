import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import itLocale from '@fullcalendar/core/locales/it'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function PresenceCalendar({ onDateClick, presences = [], onEventClick }) {
  const { profile } = useAuthStore()
  
  // Converti presenze in eventi calendario
  const events = presences.map(presence => {
    let color, title
    
    switch (presence.location_type) {
      case 'office':
        color = '#3B82F6' // Blu
        title = '🏢 Ufficio'
        break
      case 'remote':
        color = '#10B981' // Verde
        title = '🏠 Smart Working'
        break
      case 'client':
        color = '#F59E0B' // Arancio
        title = `🤝 ${presence.client_name || 'Cliente'}`
        break
      default:
        color = '#6B7280'
        title = 'Presenza'
    }
    
    return {
      id: presence.id,
      title,
      date: presence.date,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        location_type: presence.location_type,
        client_name: presence.client_name,
        notes: presence.notes,
      }
    }
  })
  
  return (
    <div className="presence-calendar">
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
        dateClick={onDateClick}
        eventClick={onEventClick}
        height="auto"
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        firstDay={1} // Lunedì come primo giorno
      />
      
      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-calendar-office" />
          <span>Ufficio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-calendar-remote" />
          <span>Smart Working</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-calendar-client" />
          <span>Cliente</span>
        </div>
      </div>
      
      <style jsx>{`
        .presence-calendar {
          --fc-border-color: var(--border-light);
          --fc-button-bg-color: #000000;
          --fc-button-border-color: #000000;
          --fc-button-hover-bg-color: #333333;
          --fc-button-hover-border-color: #333333;
          --fc-button-active-bg-color: #333333;
          --fc-today-bg-color: rgba(59, 130, 246, 0.1);
        }
        
        :global(.dark) .presence-calendar {
          --fc-border-color: #334155;
          --fc-page-bg-color: #0F172A;
          --fc-neutral-bg-color: #1E293B;
        }
        
        :global(.fc) {
          font-family: inherit;
        }
        
        :global(.fc-theme-standard td),
        :global(.fc-theme-standard th) {
          border-color: var(--fc-border-color);
        }
        
        :global(.fc-day-today) {
          background: var(--fc-today-bg-color) !important;
        }
        
        :global(.fc-event) {
          cursor: pointer;
          font-size: 0.875rem;
          padding: 2px 4px;
        }
        
        :global(.fc-event:hover) {
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}
