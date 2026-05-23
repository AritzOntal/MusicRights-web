import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getWorkById, deleteWork } from '../services/workServices'
import { useAuth } from '../contexts/AuthContext'
import type { Work } from '../types/work'
import AppLayout from '../components/AppLayout'

function WorkDetailPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  // Cogemos el :id de la URL (siempre llega como string)
  const { id } = useParams<{ id: string }>()

  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Solo los músicos pueden eliminar obras de su propio catálogo
  const isMusician = state.user?.role === 'MUSICIAN'

  async function handleDelete() {
    if (!work) return
    const ok = window.confirm(
      `¿Eliminar "${work.title}" de tu catálogo? Esta acción no se puede deshacer.`
    )
    if (!ok) return

    setActionError(null)
    setDeleting(true)
    try {
      await deleteWork(work.id)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setActionError('La obra ya no existe o no pertenece a tu catálogo.')
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setActionError('No tienes permisos para eliminar esta obra.')
        } else {
          setActionError('No se pudo eliminar la obra.')
        }
      } else {
        setActionError('Error inesperado')
      }
      setDeleting(false)
    }
  }

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

            {isMusician && (
              <div className="mt-6 pt-5 border-t border-line">
                {actionError && <p className="text-sm text-red-600 mb-3">{actionError}</p>}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium border border-red-200 text-accent transition-colors hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Eliminando…' : 'Eliminar de mi catálogo'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default WorkDetailPage
