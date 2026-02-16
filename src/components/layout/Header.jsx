import { Bell } from 'lucide-react'

export function Header({ title }) {
  return (
    <header className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark px-8 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center space-x-4">
          {/* Notifications (placeholder) */}
          <button className="relative p-2 rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
        </div>
      </div>
    </header>
  )
}
