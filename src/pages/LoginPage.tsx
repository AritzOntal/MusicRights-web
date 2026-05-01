import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
//Para evitar conflicto cambiamos nombre de import
import { login as loginService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'



function LoginPage() {
  const navigate = useNavigate()

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
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-white rounded-xl shadow border space-y-4"
      >
        <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>

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
            autoComplete="current-password"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white font-medium py-2 rounded hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-sm text-slate-600 text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-700 underline">
            Regístrate
          </Link>
        </p>
      </form>
    </main>
  )
}

export default LoginPage
