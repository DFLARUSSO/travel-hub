// src/components/modules/admin/UserManagementModal.jsx
import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/common'
import { useUsers } from '@/hooks/useUsers'
import { X } from 'lucide-react'

export function UserManagementModal({ user, onClose }) {
  const { createUser, updateUser } = useUsers()
  const isEditing = !!user

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'employee',
    department: '',
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // Non mostriamo la password in modifica
        full_name: user.full_name || '',
        role: user.role || 'employee',
        department: user.department || '',
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        await updateUser({
          id: user.id,
          full_name: formData.full_name,
          role: formData.role,
          department: formData.department,
        })
      } else {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('La password deve essere di almeno 6 caratteri')
        }
        await createUser(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {isEditing ? 'Modifica Utente' : 'Nuovo Utente'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="label">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isEditing} // Email non modificabile in edit
              placeholder="email@digitalfashionleading.com"
            />
          </div>

          {/* Password - solo in creazione */}
          {!isEditing && (
            <div>
              <label className="label">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Minimo 6 caratteri"
              />
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="label">Nome Completo *</label>
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="Mario Rossi"
            />
          </div>

          {/* Ruolo */}
          <div>
            <label className="label">Ruolo *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input"
              required
            >
              <option value="employee">Dipendente</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Dipartimento */}
          <div>
            <label className="label">Dipartimento</label>
            <Input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="IT, HR, Marketing..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : isEditing ? 'Aggiorna' : 'Crea Utente'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
