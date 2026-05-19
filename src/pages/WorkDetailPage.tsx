import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getWorkById } from '../services/workServices'
import type { Work } from '../types/work'

function WorkDetailPage() {
  const navigate = useNavigate()
  // Cogemos el :id de la URL (siempre llega como string)
  const { id } = useParams<{ id: string }>()

  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si el id de la URL no es un número válido, no llamamos al back
    const numericId = Number(id)
    if (!id || Number.isNaN(numericId)) {
      setError('Identificador de obra no válido')
      setLoading(false)
      return
    }

    setLoading(true)
    getWorkById(numericId)
      .then((data) => {
        setWork(data)
        setError(null)
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('La obra no existe')
        } else {
          setError('No se pudo cargar la obra')
        }
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-4">

        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-700 underline"
        >
          ← Volver al dashboard
        </button>

        <h1 className="text-2xl font-bold">Detalle de la obra</h1>

        {loading && <p>Cargando obra...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && work && (
          <div className="bg-white p-6 rounded shadow border space-y-3">
            <h2 className="text-xl font-semibold">{work.title}</h2>

            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="font-medium text-slate-600">ID</dt>
              <dd>{work.id}</dd>

              <dt className="font-medium text-slate-600">ISRC</dt>
              <dd>{work.isrc}</dd>

              <dt className="font-medium text-slate-600">Género</dt>
              <dd>{work.genre}</dd>

              <dt className="font-medium text-slate-600">Duración</dt>
              <dd>{work.duration ?? '—'}</dd>

              <dt className="font-medium text-slate-600">Compuesta</dt>
              <dd>{work.composedAt ?? '—'}</dd>

              <dt className="font-medium text-slate-600">Registrada</dt>
              <dd>{work.registred ? 'Sí' : 'No'}</dd>
            </dl>
          </div>
        )}
      </div>
    </main>
  )
}

export default WorkDetailPage
