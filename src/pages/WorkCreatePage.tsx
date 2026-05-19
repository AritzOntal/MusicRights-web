import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { createWork } from '../services/workServices'
import type { NewWork } from '../services/workServices'

// Regex igual a la del back para el campo ISRC
const ISRC_REGEX = /^[A-Z]{2}[A-Z0-9]{3}\d{2}\d{5}$/

function WorkCreatePage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [isrc, setIsrc] = useState('')
  const [genre, setGenre] = useState('')
  const [duration, setDuration] = useState('') // string para controlarlo y validarlo
  const [composedAt, setComposedAt] = useState('') // input TIPO DATE
  const [registred, setRegistred] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // VALIDACIÓNES
    if (title.trim().length === 0) {
      setError('El título es obligatorio')
      return
    }
    if (!ISRC_REGEX.test(isrc)) {
      setError('ISRC inválido (ej: ESABC2300123)')
      return
    }
    if (genre.trim().length === 0) {
      setError('El género es obligatorio')
      return
    }

    let durationNumber: number | null = null
    if (duration.trim() !== '') {
      const n = Number(duration)
      if (Number.isNaN(n) || n <= 0) {
        setError('La duración debe ser un número positivo')
        return
      }
      durationNumber = n
    }

    if (composedAt) {
      const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
      if (composedAt > today) {
        setError('La fecha de composición no puede ser futura')
        return
      }
    }

    setError(null)
    setLoading(true)

    const payload: NewWork = {
      title: title.trim(),
      isrc: isrc.trim(),
      genre: genre.trim(),
      duration: durationNumber,
      composedAt: composedAt || null,
      registred,
    }

    try {
      const created = await createWork(payload)
      // Si la crea, vamos a la página de detalle
      navigate(`/works/${created.id}`, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError('Datos inválidos. Revisa los campos.')
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('No tienes permisos para crear obras')
        } else if (err.response) {
          setError(`Error ${err.response.status}: no se pudo crear la obra`)
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
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-xl mx-auto space-y-4">

        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-700 underline"
        >
          ← Volver al dashboard
        </button>

        <h1 className="text-2xl font-bold">Nueva obra</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow border space-y-4">

          <label className="block">
            <span className="text-sm font-medium">Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">ISRC</span>
            <input
              type="text"
              value={isrc}
              onChange={(e) => setIsrc(e.target.value.toUpperCase())}
              disabled={loading}
              placeholder="ESABC2300123"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Género</span>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Duración (segundos)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Fecha de composición</span>
            <input
              type="date"
              value={composedAt}
              onChange={(e) => setComposedAt(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={registred}
              onChange={(e) => setRegistred(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm font-medium">Registrada</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-medium py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear obra'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default WorkCreatePage
