import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getWorkById } from '../services/workServices'
import type { Work } from '../types/work'
import AppLayout from '../components/AppLayout'

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

  const rows: Array<[string, React.ReactNode]> = work
    ? [
        ['ID', work.id],
        ['ISRC', work.isrc],
        ['Género', work.genre],
        ['Duración', work.duration ?? '—'],
        ['Compuesta', work.composedAt ?? '—'],
        ['Registrada', work.registred ? 'Sí' : 'No'],
      ]
    : []

  return (
    <AppLayout maxWidth="max-w-2xl">
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          ← Volver a obras
        </button>

        {loading && <p className="text-muted">Cargando obra…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && work && (
          <div className="card p-7">
            <h1 className="text-2xl mb-5">{work.title}</h1>
            <dl className="divide-y divide-line">
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between py-2.5 text-sm">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-ink font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default WorkDetailPage
