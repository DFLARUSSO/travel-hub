import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Presenze } from '@/pages/Presenze'
import { Foresteria } from '@/pages/Foresteria'
import { Viaggi } from '@/pages/Viaggi'
import { Admin } from '@/pages/Admin'

const queryClient = new QueryClient()

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const { theme, setTheme } = useThemeStore()
  
  useEffect(() => {
    // Initialize auth
    initialize()
    
    // Initialize theme
    setTheme(theme)
  }, [initialize, setTheme, theme])
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="presenze" element={<Presenze />} />
            <Route path="foresteria" element={<Foresteria />} />
            <Route path="viaggi" element={<Viaggi />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            color: theme === 'dark' ? '#F1F5F9' : '#1F2937',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
