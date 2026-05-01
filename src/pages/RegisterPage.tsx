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
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-white rounded-xl shadow border space-y-4"
      >
        <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>

        <label className="block">
          <span className="text-sm font-medium">Usuario</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="mt-1 w-full border rounded px-3 py-2"
            autoComplete="username"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="mt-1 w-full border rounded px-3 py-2"
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Repite la contraseña</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="mt-1 w-full border rounded px-3 py-2"
            autoComplete="new-password"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white font-medium py-2 rounded hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>

        <p className="text-sm text-slate-600 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-700 underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  )
}

export default RegisterPage
