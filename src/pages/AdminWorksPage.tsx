import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllWorks } from '../services/workServices'
import type { Work } from '../types/work'
import type { Musician } from '../types/musician'
import AppLayout from '../components/AppLayout'

function musicianName(m: Musician): string {
  return `${m.firstName ?? ''} ${m.lastName}`.trim()
}

function AdminWorksPage() {
  const navigate = useNavigate()

  // Cargamos el catálogo una vez y lo guardamos en memoria; la búsqueda es local.
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllWorks()
      .then((data) => {
        setWorks(data)
        setError(null)
      })
      .catch((err) => {
        setError('No se pudieron cargar las obras')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  const q = search.trim().toLowerCase()
  // Solo mostramos resultados cuando hay búsqueda
  const results = q
    ? works.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.isrc.toLowerCase().includes(q) ||
          (w.musicians ?? []).some((m) => musicianName(m).toLowerCase().includes(q))
      )
    : []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Obras</h1>
          <p className="text-sm text-muted mt-1">
            Busca en el catálogo por autor, título o ISRC.
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por autor, título o ISRC…"
          className="input"
          autoFocus
        />

        {loading && <p className="text-muted">Cargando catálogo…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Estado inicial: nada hasta que se busca */}
        {!loading && !error && q === '' && (
          <div className="card p-8 text-center text-muted">
            Busca por autor, título o ISRC para ver las coincidencias del catálogo.
          </div>
        )}

        {!loading && !error && q !== '' && results.length === 0 && (
          <div className="card p-10 text-center text-muted">
            No hay obras que coincidan con «{search.trim()}».
          </div>
        )}

        {!loading && !error && q !== '' && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted">
              {results.length} {results.length === 1 ? 'coincidencia' : 'coincidencias'}
            </p>
            {results.map((w) => (
              <div key={w.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => navigate(`/works/${w.id}`)}
                    className="text-accent font-medium underline-offset-2 hover:underline text-left"
                  >
                    {w.title}
                  </button>
                  <span className="text-xs text-muted whitespace-nowrap">{w.genre}</span>
                </div>
                <div className="text-sm text-muted mt-1.5 flex flex-wrap items-center gap-x-1.5">
                  <span className="text-subtle">{w.isrc}</span>
                  <span className="text-subtle">·</span>
                  {(w.musicians ?? []).length === 0 ? (
                    <span>Sin autor</span>
                  ) : (
                    w.musicians!.map((m, i) => (
                      <span key={m.id}>
                        <button
                          onClick={() => navigate(`/musicians/${m.id}`)}
                          className="text-ink underline-offset-2 hover:text-accent hover:underline"
                        >
                          {musicianName(m)}
                        </button>
                        {i < w.musicians!.length - 1 ? ',' : ''}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default AdminWorksPage
