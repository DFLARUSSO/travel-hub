// src/components/modules/presences/PresencesList.jsx
import { useState } from 'react'
import { Input, Button } from '@/components/common'
import { Search, Filter, Calendar, Download } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export function PresencesList({ presences, isLoading, onEdit, onDelete, onDateClick }) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    dateFrom: '',
    dateTo: ''
  })

  const types = [
    { value: 'all', label: 'Tutte' },
    { value: 'office', label: 'Ufficio' },
    { value: 'remote', label: 'Smart Working' },
    { value: 'client', label: 'Cliente' }
  ]

  const filteredPresences = presences?.filter(presence => {
    // Filtro ricerca
    const matchesSearch = presence.notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         presence.client_name?.toLowerCase().includes(filters.search.toLowerCase())

    // Filtro tipo
    const matchesType = filters.type === 'all' || presence.location_type === filters.type

    // Filtro date
    let matchesDate = true
    if (filters.dateFrom) {
      matchesDate = matchesDate && presence.date >= filters.dateFrom
    }
    if (filters.dateTo) {
      matchesDate = matchesDate && presence.date <= filters.dateTo
    }

    return matchesSearch && matchesType && matchesDate
  }) || []

  return (
    <Card>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Filtri */}
        <div className="flex-1 flex gap-3 flex-wrap">
          {/* Ricerca */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca per note o cliente..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Tipo */}
          <div className="relative min-w-[140px]">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input w-full"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex gap-2">
            <div>
              <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                Dal
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                Al
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex gap-2">
          <Button className="btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Esporta
          </Button>
          <Button 
            onClick={() => setFilters({ search: '', type: 'all', dateFrom: '', dateTo: '' })}
            className="btn-secondary"
          >
            Pulisci
          </Button>
        </div>
      </div>

      {/* Tabella */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="text-left p-3 font-medium text-text-primary-light dark:text-text-primary-dark">Data</th>
              <th className="text-left p-3 font-medium text-text-primary-light dark:text-text-primary-dark">Tipologia</th>
              <th className="text-left p-3 font-medium text-text-primary-light dark:text-text-primary-dark">Cliente</th>
              <th className="text-left p-3 font-medium text-text-primary-light dark:text-text-primary-dark">Note</th>
              <th className="text-right p-3 font-medium text-text-primary-light dark:text-text-primary-dark">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark">
                  Caricamento...
                </td>
              </tr>
            ) : filteredPresences.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-secondary-light dark:text-text-secondary-dark">
                  Nessuna presenza trovata
                </td>
              </tr>
            ) : (
              filteredPresences.map(presence => (
                <tr key={presence.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark">
                  <td className="p-3">
                    <div className="font-medium">{format(new Date(presence.date), 'dd MMM yyyy', { locale: it })}</div>
                    <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {format(new Date(presence.date), 'EEEE', { locale: it })}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      presence.location_type === 'office' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      presence.location_type === 'remote' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {presence.location_type === 'office' ? '🏢 Ufficio' :
                       presence.location_type === 'remote' ? '🏠 Smart' : '👔 Cliente'}
                    </span>
                  </td>
                  <td className="p-3">
                    {presence.client_name ? presence.client_name : '-'}
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="line-clamp-2">{presence.notes || '-'}</div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => onDateClick(presence.date)}
                        className="btn-sm btn-secondary px-3"
                        size="sm"
                      >
                        Modifica
                      </Button>
                      <Button
                        onClick={() => onDelete(presence.id)}
                        className="btn-sm bg-red-600 hover:bg-red-700 text-white px-3"
                        size="sm"
                      >
                        Elimina
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Statistiche */}
      {!isLoading && filteredPresences.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <div className="flex flex-wrap gap-4">
            <span>Trovate {filteredPresences.length} presenze</span>
            <span>
              Periodo: {filters.dateFrom || 'Tutte'} → {filters.dateTo || 'Tutte'}
            </span>
            <span>
              Tipo: {types.find(t => t.value === filters.type)?.label || 'Tutte'}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
