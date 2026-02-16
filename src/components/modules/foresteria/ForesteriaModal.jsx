import { useState, useEffect } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { format, differenceInDays, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export function ForesteriaModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  selectedDate,
  availability = 3, // Posti disponibili
  existingRequest = null
}) {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    notes: '',
  })
  
 useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        checkIn: selectedDate,
        checkOut: ''
      }))
    } else if (existingRequest) {
      setFormData({
        checkIn: existingRequest.check_in,
        checkOut: existingRequest.check_out,
        notes: existingRequest.notes || '',
      })
    }
  }, [selectedDate, existingRequest])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    onSubmit({
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      notes: formData.notes,
    })
    
    handleClose()
  }
  
  const handleClose = () => {
    setFormData({
      checkIn: '',
      checkOut: '',
      notes: '',
    })
    onClose()
  }
  
  // Calcola giorni e disponibilità
  const nights = formData.checkIn && formData.checkOut 
    ? differenceInDays(parseISO(formData.checkOut), parseISO(formData.checkIn))
    : 0
  
  const availabilityColor = availability === 0 
    ? 'text-status-error' 
    : availability === 1 
    ? 'text-status-warning' 
    : 'text-status-success'
  
  const availabilityText = availability === 0
    ? '❌ Nessun posto disponibile'
    : availability === 1
    ? '⚠️ Ultimo posto disponibile'
    : `✅ ${availability}/3 posti disponibili`
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingRequest ? '✏️ Modifica Richiesta Foresteria' : '🏠 Richiesta Foresteria'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info disponibilità */}
        <div className={`p-4 rounded-lg border ${
          availability === 0 
            ? 'bg-red-50 dark:bg-red-900/20 border-status-error' 
            : availability === 1
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-status-warning'
            : 'bg-green-50 dark:bg-green-900/20 border-status-success'
        }`}>
          <p className={`font-semibold ${availabilityColor}`}>
            {availabilityText}
          </p>
          {availability === 0 && (
            <p className="text-sm mt-1 text-text-secondary-light dark:text-text-secondary-dark">
              Non è possibile fare richieste per questo periodo
            </p>
          )}
        </div>
        
        {/* Date */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Check-in *"
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            required
            min={format(new Date(), 'yyyy-MM-dd')}
          />
          
          <Input
            type="date"
            label="Check-out *"
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            required
            min={formData.checkIn || format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        
        {/* Info pernottamenti */}
        {nights > 0 && (
          <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            📅 {nights} {nights === 1 ? 'notte' : 'notti'}
          </div>
        )}
        {/* Motivo/Note */}
        <div>
          <label className="label">Motivo della richiesta *</label>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="es: Trasferta presso cliente milanese, rientro tardivo dopo meeting..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            required
          />
        </div>
        
        {/* Info approvazione */}
        <div className="p-3 bg-surface-light dark:bg-surface-dark rounded-lg text-sm">
          ⚠️ <strong>La richiesta sarà valutata da HR/Admin</strong>
          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">
            Riceverai una notifica dell'esito
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Annulla
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={availability === 0}
          >
            {existingRequest ? 'Aggiorna' : 'Invia Richiesta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
