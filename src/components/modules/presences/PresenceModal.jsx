// src/components/modules/presences/PresenceModal.jsx
import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/common'
import { X, AlertTriangle, Trash2, Calendar } from 'lucide-react'
import { format, eachDayOfInterval, isWeekend } from 'date-fns'
import { it } from 'date-fns/locale'

export function PresenceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  selectedDate, 
  presence,
  onUpdate,
  onDelete,
  getPresenceByDate 
}) {
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [locationType, setLocationType] = useState('office')
  const [clientName, setClientName] = useState('')
  const [notes, setNotes] = useState('')
  const [isPeriod, setIsPeriod] = useState(false)
  
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictingDates, setConflictingDates] = useState([])

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate)
      setEndDate(selectedDate)
      setLocationType('office')
      setClientName('')
      setNotes('')
      setIsPeriod(false)
    }

    if (presence) {
      setDate(presence.date)
      setEndDate(presence.date)
      setLocationType(presence.location_type)
      setClientName(presence.client_name || '')
      setNotes(presence.notes || '')
      setIsPeriod(false)
    }
  }, [selectedDate, presence])

  const resetForm = () => {
    setDate('')
    setEndDate('')
    setLocationType('office')
    setClientName('')
    setNotes('')
    setIsPeriod(false)
    setShowConflictDialog(false)
    setConflictingDates([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const checkForConflicts = () => {
    if (isPeriod) {
      const dates = eachDayOfInterval({
        start: new Date(date),
        end: new Date(endDate)
      }).filter(d => !isWeekend(d))

      const conflicts = dates
        .map(d => {
          const dateStr = format(d, 'yyyy-MM-dd')
          const existing = getPresenceByDate(dateStr)
          return existing ? { date: dateStr, existing } : null
        })
        .filter(Boolean)

      return conflicts
    } else {
      const existing = getPresenceByDate(date)
      if (existing && !presence) {
        return [{ date, existing }]
      }
    }
    return []
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (presence && onUpdate) {
      onUpdate({
        id: presence.id,
        location_type: locationType,
        client_name: clientName || null,
        notes: notes || null
      })
      handleClose()
      return
    }

    const conflicts = checkForConflicts()
    
    if (conflicts.length > 0) {
      setConflictingDates(conflicts)
      setShowConflictDialog(true)
      return
    }

    submitForm(false)
  }

  const submitForm = (overwriteAll = false) => {
    if (isPeriod) {
      const dates = eachDayOfInterval({
        start: new Date(date),
        end: new Date(endDate)
      })
        .filter(d => !isWeekend(d))
        .map(d => format(d, 'yyyy-MM-dd'))

      onSubmit({
        dates,
        locationType,
        clientName,
        notes,
        overwriteAll
      })
    } else {
      const existing = getPresenceByDate(date)
      onSubmit({
        date,
        locationType,
        clientName,
        notes,
        overwrite: overwriteAll || (!!existing && !presence),
        existingId: presence?.id || existing?.id
      })
    }

    handleClose()
  }

  // Modal Conflitti - Usa Modal Base
  if (showConflictDialog) {
    return (
      <Modal isOpen onClose={() => setShowConflictDialog(false)} size="sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-status-warning" />
            </div>
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Conferma Sovrascrittura
            </h2>
          </div>

          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            {conflictingDates.length === 1 
              ? 'Hai già registrato una presenza per questa data:'
              : `Hai già registrato presenze per ${conflictingDates.length} date nel periodo:`
            }
          </p>

          <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
            {conflictingDates.map(({ date: d, existing }) => (
              <div key={d} className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark last:border-0">
                <span className="text-sm font-medium">
                  {format(new Date(d), 'dd MMM yyyy', { locale: it })}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  {existing.location_type === 'office' ? '🏢 Ufficio' :
                   existing.location_type === 'remote' ? '🏠 Smart Working' : 
                   `👔 ${existing.client_name || 'Cliente'}`}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-text-primary-light dark:text-text-primary-dark mb-6">
            Vuoi sostituirle con <strong>{
              locationType === 'office' ? '🏢 Ufficio' :
              locationType === 'remote' ? '🏠 Smart Working' : 
              `👔 ${clientName || 'Cliente'}`
            }</strong>?
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowConflictDialog(false)}
              className="flex-1 btn-secondary"
            >
              Annulla
            </Button>
            <Button
              onClick={() => {
                setShowConflictDialog(false)
                submitForm(true)
              }}
              className="flex-1 btn-primary"
            >
              Sovrascrivi
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  // Modal Principale - SOLO CONTENUTO, il wrapper Modal è già fornito
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-surface-dark rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {presence ? 'Modifica Presenza' : 'Registra Presenza'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Checkbox Periodo */}
              {!presence && (
                <label className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPeriod}
                    onChange={(e) => setIsPeriod(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Registra un periodo (esclusi i weekend)
                  </span>
                </label>
              )}

              {/* Date */}
              {isPeriod ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Data inizio *
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Data fine *
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={date}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Data *
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={!!presence}
                  />
                </div>
              )}

              {/* Dove lavori */}
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  Dove lavori? *
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="office">🏢 Ufficio</option>
                  <option value="remote">🏠 Smart Working</option>
                  <option value="client">👔 Cliente</option>
                </select>
              </div>

              {/* Nome Cliente */}
              {locationType === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Nome Cliente *
                  </label>
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="es: Prada, Gucci..."
                    required
                  />
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  Note
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full min-h-[100px] resize-none"
                  placeholder="Note aggiuntive..."
                />
              </div>

              {/* Warning */}
              {!presence && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Le presenze verranno registrate automaticamente. Riceverai conferma dell'operazione.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 bg-surface-light dark:bg-background-dark border-t border-border-light dark:border-border-dark">
              {presence && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Sei sicuro di voler eliminare questa presenza?')) {
                      onDelete(presence.id)
                      handleClose()
                    }
                  }}
                  className="flex items-center gap-2 text-status-error hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Elimina
                </button>
              ) : (
                <div></div>
              )}
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleClose} 
                  className="px-6 py-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors font-medium"
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  {presence ? 'Aggiorna' : 'Salva Presenza'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
