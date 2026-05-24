import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
// Importamos el servicio para poder llamarlo
import { register } from '../services/authService'
import Footer from '../components/Footer'

function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Se llama cuando el usuario pulsa "Registrarse"
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault() // evita que el form recargue la página

    if (username.trim().length < 3) {
      setError('El usuario debe tener al menos 3 caracteres')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones para registrarte')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await register(username, password)
      // Si no hay problema, cambiamos de página con "navigate" (sin Link)
      navigate('/login', { replace: true })
    } catch (err) {
      // Si axios manda error, usaremos setError para verlo
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Error ${err.response.status}: no se pudo registrar el usuario`)
        } else {
          setError('No se pudo conectar con el servidor.')
        }
      } else {
        setError('Error inesperado')
      }
    } finally {
      // Siempre quitamos el loading al acabar (haya ido bien o mal)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-accent">MusicRights</h1>
          <p className="text-sm text-muted mt-2">Crea tu cuenta para empezar</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          <h2 className="text-lg">Crear cuenta</h2>

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
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">Repite la contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="input"
              autoComplete="new-password"
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 accent-ink"
            />
            <span className="text-muted">
              Acepto los{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-accent underline underline-offset-2">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-accent underline underline-offset-2">
                política de privacidad
              </a>
              .
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading || !acceptedTerms} className="btn-primary w-full">
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>

          <p className="text-sm text-muted text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-accent font-medium underline underline-offset-2">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
      </main>

      <Footer variant="compact" />
    </div>
  )
}

export default RegisterPage
