import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWorks } from '../hooks/useWorks'
import type { Musician } from '../types/musician'
import AppLayout from '../components/AppLayout'

type SortColumn = 'title' | 'genre' | 'duration' | 'composedAt'

function musicianName(m: Musician): string {
  return `${m.firstName ?? ''} ${m.lastName}`.trim()
}

function DashboardPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const { works, loading, error } = useWorks()

  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('title')
  const [asc, setAsc] = useState(true)

  const role = state.user?.role

  // El admin tiene sus propias páginas (Usuarios / Obras); no usa este dashboard
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  const q = search.trim().toLowerCase()

  // ===== Dashboard del MÚSICO: su catálogo, como antes =====
  if (role === 'MUSICIAN') {
    const filtered = q
      ? works.filter((w) => w.title.toLowerCase().includes(q) || w.genre.toLowerCase().includes(q))
      : works
    const sorted = [...filtered].sort((a, b) => {
      const va = a[sortColumn]
      const vb = b[sortColumn]
      if (va == null) return 1
      if (vb == null) return -1
      if (va < vb) return asc ? -1 : 1
      if (va > vb) return asc ? 1 : -1
      return 0
    })
    const total = works.length
    const registered = works.filter((w) => w.registred).length
    const genres = new Set(works.map((w) => w.genre)).size
    const toggleSort = (c: SortColumn) => {
      if (c === sortColumn) setAsc(!asc)
      else {
        setSortColumn(c)
        setAsc(true)
      }
    }

    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl">Mis obras</h1>
              <p className="text-sm text-muted mt-1">
                Hola, <span className="text-ink font-medium">{state.user?.username}</span>. Gestiona tu repertorio.
              </p>
            </div>
            <button onClick={() => navigate('/works/new')} className="btn-primary">
              + Nueva obra
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-paper border border-line p-4">
              <div className="text-xs text-muted">Total de obras</div>
              <div className="font-serif text-2xl font-semibold mt-1">{total}</div>
            </div>
            <div className="rounded-xl bg-paper border border-line p-4">
              <div className="text-xs text-muted">Registradas</div>
              <div className="font-serif text-2xl font-semibold mt-1">{registered}</div>
            </div>
            <div className="rounded-xl bg-paper border border-line p-4">
              <div className="text-xs text-muted">Géneros</div>
              <div className="font-serif text-2xl font-semibold mt-1">{genres}</div>
            </div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o género…"
            className="input"
          />

          {loading && <p className="text-muted">Cargando obras…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && sorted.length === 0 && (
            <div className="card p-10 text-center text-muted">No hay obras todavía.</div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-line text-muted">
                  <tr>
                    <th onClick={() => toggleSort('title')} className="p-3 text-left font-medium cursor-pointer hover:text-ink">Título</th>
                    <th onClick={() => toggleSort('genre')} className="p-3 text-left font-medium cursor-pointer hover:text-ink">Género</th>
                    <th onClick={() => toggleSort('duration')} className="p-3 text-left font-medium cursor-pointer hover:text-ink">Duración</th>
                    <th onClick={() => toggleSort('composedAt')} className="p-3 text-left font-medium cursor-pointer hover:text-ink">Compuesta</th>
                    <th className="p-3 text-left font-medium">Registrada</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((w) => (
                    <tr
                      key={w.id}
                      onClick={() => navigate(`/works/${w.id}`)}
                      className="border-t border-line cursor-pointer hover:bg-paper"
                    >
                      <td className="p-3 font-medium">{w.title}</td>
                      <td className="p-3 text-muted">{w.genre}</td>
                      <td className="p-3 text-muted">{w.duration ?? '—'}</td>
                      <td className="p-3 text-muted">{w.composedAt ?? '—'}</td>
                      <td className="p-3">
                        <span className={w.registred ? 'badge-neutral' : 'badge-warn'}>
                          {w.registred ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppLayout>
    )
  }

  // ===== Dashboard del USUARIO normal: descubrir + buscar + hazte músico =====
  const results = q
    ? works.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.genre.toLowerCase().includes(q) ||
          (w.musicians ?? []).some((m) => musicianName(m).toLowerCase().includes(q))
      )
    : []

  return (
    <AppLayout maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="text-center pt-4">
          <h1 className="text-3xl sm:text-4xl">Descubre canciones de artistas de nuestro país</h1>
          <p className="text-sm text-muted mt-3 max-w-md mx-auto">
            Explora el catálogo de obras registradas por músicos independientes.
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, género o autor…"
          className="input"
          autoFocus
        />

        {loading && <p className="text-muted">Cargando catálogo…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Sin búsqueda: llamada destacada a hacerse músico en el centro */}
        {!loading && !error && q === '' && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-ink p-10 text-center text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="mx-auto mb-3 h-7 w-7"
              style={{ opacity: 0.85 }}
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <h2 className="font-serif text-2xl text-white">Tu música, tus derechos</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
              Centraliza tus conciertos y obras y genera tus documentos de SGAE sin complicaciones.
            </p>
            <button onClick={() => navigate('/musicians/me')} className="btn-primary mt-6">
              Hazte músico y empieza a gestionar tus derechos
            </button>
          </div>
        )}

        {!loading && !error && q !== '' && results.length === 0 && (
          <div className="card p-10 text-center text-muted">
            No hay canciones que coincidan con «{search.trim()}».
          </div>
        )}

        {!loading && !error && q !== '' && results.length > 0 && (
          <div className="space-y-2">
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
                  {(w.musicians ?? []).length === 0 ? (
                    <span className="text-subtle">Autor no especificado</span>
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

export default DashboardPage
