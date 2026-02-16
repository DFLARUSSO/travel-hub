import { useState, useEffect } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Plane, Train, Car, Hotel } from 'lucide-react'

export function TravelModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  existingRequest = null
}) {
  const [formData, setFormData] = useState({
    destination: '',
    departureDate: '',
    returnDate: '',
    purpose: '',
    needsFlight: false,
    needsTrain: false,
    needsTaxi: false,
    needsHotel: false,
    hotelPreferences: '',
    transportPreferences: '',
    budgetEstimate: '',
  })
  
  useEffect(() => {
    if (existingRequest) {
      setFormData({
        destination: existingRequest.destination,
        departureDate: existingRequest.departure_date,
        returnDate: existingRequest.return_date,
        purpose: existingRequest.purpose,
        needsFlight: existingRequest.needs_flight,
        needsTrain: existingRequest.needs_train,
        needsTaxi: existingRequest.needs_taxi,
        needsHotel: existingRequest.needs_hotel,
        hotelPreferences: existingRequest.hotel_preferences || '',
        transportPreferences: existingRequest.transport_preferences || '',
        budgetEstimate: existingRequest.budget_estimate || '',
      })
    }
  }, [existingRequest])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    onSubmit({
      destination: formData.destination,
      departureDate: formData.departureDate,
      returnDate: formData.returnDate,
      purpose: formData.purpose,
      needsFlight: formData.needsFlight,
      needsTrain: formData.needsTrain,
      needsTaxi: formData.needsTaxi,
      needsHotel: formData.needsHotel,
      hotelPreferences: formData.hotelPreferences,
      transportPreferences: formData.transportPreferences,
      budgetEstimate: formData.budgetEstimate ? parseFloat(formData.budgetEstimate) : null,
    })
    
    handleClose()
  }
  
  const handleClose = () => {
    setFormData({
      destination: '',
      departureDate: '',
      returnDate: '',
      purpose: '',
      needsFlight: false,
      needsTrain: false,
      needsTaxi: false,
      needsHotel: false,
      hotelPreferences: '',
      transportPreferences: '',
      budgetEstimate: '',
    })
    onClose()
  }
  
  const days = formData.departureDate && formData.returnDate 
    ? differenceInDays(parseISO(formData.returnDate), parseISO(formData.departureDate)) + 1
    : 0
  
  const hasServices = formData.needsFlight || formData.needsTrain || formData.needsTaxi || formData.needsHotel
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingRequest ? '✏️ Modifica Richiesta Viaggio' : '✈️ Richiesta Viaggio'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destinazione e Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <Input
              type="text"
              label="Destinazione *"
              placeholder="es: Milano, Parigi, New York..."
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </div>
          
          <Input
            type="date"
            label="Data Partenza *"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            required
            min={format(new Date(), 'yyyy-MM-dd')}
          />
          
          <Input
            type="date"
            label="Data Ritorno *"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            required
            min={formData.departureDate || format(new Date(), 'yyyy-MM-dd')}
          />
          
          <div className="flex items-end">
            {days > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm w-full">
                📅 {days} {days === 1 ? 'giorno' : 'giorni'}
              </div>
            )}
          </div>
        </div>
        
        {/* Motivo */}
        <div>
          <label className="label">Motivo del viaggio *</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="es: Meeting con cliente, partecipazione fiera, formazione..."
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
          />
        </div>
        
        {/* Servizi Richiesti */}
        <div>
          <label className="label">Servizi richiesti *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.needsFlight 
                ? 'border-primary bg-primary/5' 
                : 'border-border-light dark:border-border-dark hover:border-primary/50'
            }`}>
              <input
                type="checkbox"
                checked={formData.needsFlight}
                onChange={(e) => setFormData({ ...formData, needsFlight: e.target.checked })}
                className="sr-only"
              />
              <Plane size={32} className={formData.needsFlight ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'} />
              <span className={`font-medium text-sm ${formData.needsFlight ? 'text-primary' : ''}`}>
                Aereo
              </span>
            </label>
            
            <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.needsTrain 
                ? 'border-primary bg-primary/5' 
                : 'border-border-light dark:border-border-dark hover:border-primary/50'
            }`}>
              <input
                type="checkbox"
                checked={formData.needsTrain}
                onChange={(e) => setFormData({ ...formData, needsTrain: e.target.checked })}
                className="sr-only"
              />
              <Train size={32} className={formData.needsTrain ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'} />
              <span className={`font-medium text-sm ${formData.needsTrain ? 'text-primary' : ''}`}>
                Treno
              </span>
            </label>
            
            <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.needsTaxi 
                ? 'border-primary bg-primary/5' 
                : 'border-border-light dark:border-border-dark hover:border-primary/50'
            }`}>
              <input
                type="checkbox"
                checked={formData.needsTaxi}
                onChange={(e) => setFormData({ ...formData, needsTaxi: e.target.checked })}
                className="sr-only"
              />
              <Car size={32} className={formData.needsTaxi ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'} />
              <span className={`font-medium text-sm ${formData.needsTaxi ? 'text-primary' : ''}`}>
                Taxi
              </span>
            </label>
            
            <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.needsHotel 
                ? 'border-primary bg-primary/5' 
                : 'border-border-light dark:border-border-dark hover:border-primary/50'
            }`}>
              <input
                type="checkbox"
                checked={formData.needsHotel}
                onChange={(e) => setFormData({ ...formData, needsHotel: e.target.checked })}
                className="sr-only"
              />
              <Hotel size={32} className={formData.needsHotel ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'} />
              <span className={`font-medium text-sm ${formData.needsHotel ? 'text-primary' : ''}`}>
                Hotel
              </span>
            </label>
          </div>
          {!hasServices && (
            <p className="text-sm text-status-error mt-2">
              ⚠️ Seleziona almeno un servizio
            </p>
          )}
        </div>
        
        {/* Preferenze Hotel */}
        {formData.needsHotel && (
          <div>
            <label className="label">Preferenze Hotel (opzionale)</label>
            <textarea
              className="input min-h-[60px] resize-none"
              placeholder="es: Vicino al centro, 4 stelle, colazione inclusa..."
              value={formData.hotelPreferences}
              onChange={(e) => setFormData({ ...formData, hotelPreferences: e.target.value })}
            />
          </div>
        )}
        
        {/* Preferenze Trasporto */}
        {(formData.needsFlight || formData.needsTrain) && (
          <div>
            <label className="label">Preferenze Trasporto (opzionale)</label>
            <textarea
              className="input min-h-[60px] resize-none"
              placeholder="es: Preferenza orari mattina, classe business, no scali..."
              value={formData.transportPreferences}
              onChange={(e) => setFormData({ ...formData, transportPreferences: e.target.value })}
            />
          </div>
        )}
        
        {/* Budget */}
        <Input
          type="number"
          label="Budget Stimato (opzionale)"
          placeholder="es: 500"
          value={formData.budgetEstimate}
          onChange={(e) => setFormData({ ...formData, budgetEstimate: e.target.value })}
          min="0"
          step="0.01"
        />
        
        {/* Info approvazione */}
        <div className="p-3 bg-surface-light dark:bg-surface-dark rounded-lg text-sm">
          ⚠️ <strong>La richiesta richiede approvazione Manager</strong>
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
            disabled={!hasServices}
          >
            {existingRequest ? 'Aggiorna' : 'Invia Richiesta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
