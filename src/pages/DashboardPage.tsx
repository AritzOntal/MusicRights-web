import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWorks } from '../hooks/useWorks'
import AppLayout from '../components/AppLayout'

type SortColumn = 'title' | 'genre' | 'duration' | 'composedAt'


function DashboardPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const { works, loading, error } = useWorks()

  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('title')
  const [asc, setAsc] = useState(true)

  const role = state.user?.role
  const isUser = role === 'USER'
  const isMusician = role === 'MUSICIAN'

  // Filtro por búsqueda
  const q = search.trim().toLowerCase()
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

  // Resumen
  const total = works.length
  const registered = works.filter((w) => w.registred).length
  const genres = new Set(works.map((w) => w.genre)).size

  function toggleSort(c: SortColumn) {
    if (c === sortColumn) setAsc(!asc)
    else { setSortColumn(c); setAsc(true) }
  }

  const roleLabel = isUser ? 'usuario' : isMusician ? 'músico' : 'administrador'
  const secondaryLabel = role === 'MUSICIAN' ? 'Registradas' : role === 'ADMIN' ? 'Sin registrar' : 'Disponibles'
  const secondaryValue = role === 'MUSICIAN' ? registered : role === 'ADMIN' ? total - registered : total

  return (
    <AppLayout>
      <div className="space-y-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">Obras</h1>
            <p className="text-sm text-muted mt-1">
              Hola, <span className="text-ink font-medium">{state.user?.username}</span>. Estás como {roleLabel}.
            </p>
          </div>
          {isMusician && (
            <button onClick={() => navigate('/works/new')} className="btn-primary">
              + Nueva obra
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-paper border border-line p-4">
            <div className="text-xs text-muted">Total de obras</div>
            <div className="font-serif text-2xl font-semibold mt-1">{total}</div>
          </div>
          <div className="rounded-xl bg-paper border border-line p-4">
            <div className="text-xs text-muted">{secondaryLabel}</div>
            <div className="font-serif text-2xl font-semibold mt-1">{secondaryValue}</div>
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
                  {!isUser && <th className="p-3 text-left font-medium">Registrada</th>}
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
                    {!isUser && (
                      <td className="p-3">
                        <span className={w.registred ? 'badge-neutral' : 'badge-warn'}>
                          {w.registred ? 'Sí' : 'No'}
                        </span>
                      </td>
                    )}
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

export default DashboardPage
