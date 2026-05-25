import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
//Para evitar conflicto cambiamos nombre de import
import { login as loginService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // Mensaje informativo que llega de otras páginas (p. ej. al hacerse músico)
  const info = (location.state as { info?: string } | null)?.info ?? null

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const token = await loginService(username, password)
      login(token)   // el AuthContext decodifica, persiste y actualiza el state

      // 3. Navegamos al dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Manejo de forbidden o Unauthorized y desconocidos
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Usuario o contraseña incorrectos')
        } else if (err.response) {
          setError(`Error ${err.response.status}: no se pudo iniciar sesión`)
        } else {
          setError('No se pudo conectar con el servidor')
        }
      } else {
        setError('Error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-accent">MusicRights</h1>
          <p className="text-sm text-muted mt-2">Gestión de derechos de autor para músicos</p>
        </div>

        {info && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          <h2 className="text-lg">Iniciar sesión</h2>

          <div>
            <label htmlFor="username" className="label">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="input"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="input"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="text-sm text-muted text-center">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-accent font-medium underline underline-offset-2">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
      </main>

      <Footer variant="compact" />
    </div>
  )
}

export default LoginPage
