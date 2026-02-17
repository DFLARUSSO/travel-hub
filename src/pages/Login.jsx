import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import toast from 'react-hot-toast'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await signIn(email, password)
      toast.success('Accesso effettuato con successo!')
      navigate('/')
    } catch (error) {
      toast.error('Credenziali non valide. Riprova.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-lighter p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-strong mb-4">
            <span className="text-4xl font-bold text-primary">DFL</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Digital Fashion Leading</h1>
          <p className="text-white/80">Travel HUB</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-strong p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Accedi</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="nome.cognome@dflconsulting.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <p>Hai dimenticato la password?</p>
            <a href="#" className="text-accent hover:underline">
              Contatta l'amministratore
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/60">
          <p>© 2026 Digital Fashion Leading</p>
          <p>Tutti i diritti riservati</p>
        </div>
      </div>
    </div>
  )
}
