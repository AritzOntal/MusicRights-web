import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
// Importamos el servicio para poder llamarlo
import { register } from '../services/authService'

function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-paper px-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
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
  )
}

export default RegisterPage
