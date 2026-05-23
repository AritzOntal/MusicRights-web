import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getMusicianById } from '../services/musicianService'
import type { Musician } from '../types/musician'
import AppLayout from '../components/AppLayout'

function MusicianDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [musician, setMusician] = useState<Musician | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const numericId = Number(id)
    if (!id || Number.isNaN(numericId)) {
      setError('Identificador de músico no válido')
      setLoading(false)
      return
    }

    setLoading(true)
    getMusicianById(numericId)
      .then((data) => {
        setMusician(data)
        setError(null)
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('El músico no existe')
        } else {
          setError('No se pudo cargar el músico')
        }
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [id])

  const fullName = musician ? `${musician.firstName ?? ''} ${musician.lastName}`.trim() : ''

  const rows: Array<[string, string]> = musician
    ? [
        ['Nombre', fullName],
        ['DNI', musician.dni],
        ['Fecha de nacimiento', musician.birthDate ?? '—'],
        ['Afiliado a SGAE', musician.affiliated ? 'Sí' : 'No'],
        ['Nº de afiliación', musician.affiliatedNumber ? String(musician.affiliatedNumber) : '—'],
        ['Caché por actuación', musician.performanceFee != null ? `${musician.performanceFee} €` : '—'],
      ]
    : []

  return (
    <AppLayout maxWidth="max-w-2xl">
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          ← Volver
        </button>

        {loading && <p className="text-muted">Cargando músico…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && musician && (
          <div className="card p-7">
            <h1 className="text-2xl mb-5">{fullName}</h1>
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

export default MusicianDetailPage
