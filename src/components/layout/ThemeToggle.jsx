import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-text-secondary-light dark:text-text-secondary-dark" />
      ) : (
        <Sun size={20} className="text-text-secondary-light dark:text-text-secondary-dark" />
      )}
    </button>
  )
}
