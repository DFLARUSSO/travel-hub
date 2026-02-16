// src/pages/Admin.jsx
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, Button } from '@/components/common'
import { useAuthStore } from '@/stores/authStore'
import { useUsers } from '@/hooks/useUsers'
import { UserManagementModal } from '@/components/modules/admin/UserManagementModal'
import { Users, Plus, Edit2, Trash2, Shield, UserCircle } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import toast from 'react-hot-toast'

export function Admin() {
  const { profile } = useAuthStore()
  const { users, loading, deleteUser } = useUsers()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-text-primary-light dark:text-text-primary-dark">
              Non hai i permessi per accedere a questa pagina.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione è irreversibile.')) {
      return
    }

    try {
      await deleteUser(userId)
      toast.success('Utente eliminato con successo')
    } catch (error) {
      toast.error('Errore durante l\'eliminazione dell\'utente')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Shield },
      manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Users },
      employee: { label: 'Dipendente', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: UserCircle },
    }
    const badge = badges[role] || badges.employee
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Gestione Utenti
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Gestisci gli utenti dell'applicazione
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuovo Utente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Admin</p>
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {users?.filter(u => u.role === 'admin').length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Manager</p>
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {users?.filter(u => u.role === 'manager').length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Dipendenti</p>
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {users?.filter(u => u.role === 'employee').length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark">
                Caricamento utenti...
              </p>
            ) : users && users.length > 0 ? (
              <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                <thead className="bg-surface-light dark:bg-surface-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Ruolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Dipartimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Creato il
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-background-dark divide-y divide-border-light dark:divide-border-dark">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                              {user.full_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-primary-light dark:text-text-primary-dark">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {user.created_at ? format(new Date(user.created_at), 'd MMM yyyy', { locale: it }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          disabled={user.id === profile?.id}
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark">
                Nessun utente trovato
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* User Management Modal */}
      {isModalOpen && (
        <UserManagementModal
          user={editingUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
