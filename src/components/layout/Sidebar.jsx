import { NavLink } from 'react-router-dom'
import { Home, Users, Building2, Plane, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar() {
  const { profile, signOut } = useAuthStore()
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Presenze', path: '/presenze', icon: Users },
    { name: 'Foresteria', path: '/foresteria', icon: Building2 },
    { name: 'Viaggi', path: '/viaggi', icon: Plane },
  ]
  
  // Admin-only
  if (profile?.role === 'admin' || profile?.role === 'manager') {
    navigation.push({ name: 'Admin', path: '/admin', icon: Settings })
  }
  
  return (
    <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark">
      {/* Logo */}
      <div className="p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="DFL Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="font-bold text-lg">DFL</h1>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Digital Fashion Leading
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-background-light dark:hover:bg-background-dark'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          )
        })}
      </nav>
      
      {/* User Info & Actions */}
      <div className="p-4 border-t border-border-light dark:border-border-dark space-y-3">
        {/* User Info */}
        <div className="px-4 py-3 bg-surface-light dark:bg-background-dark rounded-lg">
          <p className="font-medium text-sm">{profile?.full_name}</p>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
            {profile?.email}
          </p>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
            profile?.role === 'admin' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : profile?.role === 'manager'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          }`}>
            {profile?.role === 'admin' ? '👑 Admin' : profile?.role === 'manager' ? '⭐ Manager' : '👤 Dipendente'}
          </span>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4">
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Tema
          </span>
          <ThemeToggle />
        </div>
        
        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-status-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Esci</span>
        </button>
      </div>
    </div>
  )
}
