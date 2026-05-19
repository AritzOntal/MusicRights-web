import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWorks } from '../hooks/useWorks'

type SortColumn = 'title' | 'genre' | 'duration' | 'composedAt'


function DashboardPage() {
  const navigate = useNavigate()
  const { state, logout } = useAuth()
  const { works, loading, error } = useWorks()

  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('title')
  const [asc, setAsc] = useState(true)

  const isUser = state.user?.role === 'USER'
  const isMusician = state.user?.role === 'MUSICIAN'

  // Filtro por búsqueda
  const q = search.trim().toLowerCase()
  // Si hay algo en la busqueda, filtramos por las obras de la llamada
  const filtered = q
    //Inlcuides = coincide con la busqueda
    ? works.filter((w) => w.title.toLowerCase().includes(q) || w.genre.toLowerCase().includes(q))
    : works

  // Esparce con filtered y sort modifica
  //1 es a
  //-1 es b
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
  //Con Set te aseguras de que sean distintos los generos
  const genres = new Set(works.map((w) => w.genre)).size

  function toggleSort(c: SortColumn) {
    if (c === sortColumn) setAsc(!asc)
    else { setSortColumn(c); setAsc(true) }
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Dashboard — {state.user?.username} ({state.user?.role})
          </h1>
          <div className="flex gap-2">
            {isMusician && (
              <button
                onClick={() => navigate('/works/new')}
                className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
              >
                + Nueva obra
              </button>
            )}
            {isUser && (
              <button
                onClick={() => navigate('/musicians/me')}
                className="bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-800"
              >
                Hazte músico
              </button>
            )}
            <button onClick={logout} className="bg-red-600 text-white px-3 py-1 rounded">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded shadow border">Total: <b>{total}</b></div>

          {/* Tarjeta central que cambia según el rol */}
          {state.user?.role === 'ADMIN' && (
            <div className="bg-white p-3 rounded shadow border">Sin registrar: <b>{total - registered}</b></div>
          )}
          {state.user?.role === 'MUSICIAN' && (
            <div className="bg-white p-3 rounded shadow border">Registradas: <b>{registered}</b></div>
          )}
          {state.user?.role === 'USER' && (
            <div className="bg-white p-3 rounded shadow border">Disponibles: <b>{total}</b></div>
          )}

          <div className="bg-white p-3 rounded shadow border">Géneros: <b>{genres}</b></div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título o género..."
          className="w-full border rounded px-3 py-2"
        />

        {state.user?.role === 'ADMIN' && (
          <p className="text-sm bg-red-50 border border-red-200 p-3 rounded">
            Consulta todas la obras del sistema como: <b>administrador</b>
          </p>
        )}
        {state.user?.role === 'MUSICIAN' && (
          <p className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded">
            Gestiona tu repertorio como: <b>músico</b>
          </p>
        )}
        {state.user?.role === 'USER' && (
          <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded">
            Consulta le catálogo de obras como: <b>usuario</b>
          </p>
        )}

        {loading && <p>Cargando obras...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && sorted.length === 0 && <p>No hay obras.</p>}

        {!loading && !error && sorted.length > 0 && (
          <table className="w-full bg-white rounded shadow border">
            <thead className="bg-slate-100">
              <tr>
                <th onClick={() => toggleSort('title')} className="p-2 text-left cursor-pointer">Título</th>
                <th onClick={() => toggleSort('genre')} className="p-2 text-left cursor-pointer">Género</th>
                <th onClick={() => toggleSort('duration')} className="p-2 text-left cursor-pointer">Duración</th>
                <th onClick={() => toggleSort('composedAt')} className="p-2 text-left cursor-pointer">Compuesta</th>
                {!isUser && <th className="p-2 text-left">Registrada</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => navigate(`/works/${w.id}`)}
                  className="border-t cursor-pointer hover:bg-slate-50"
                >
                  <td className="p-2">{w.title}</td>
                  <td className="p-2">{w.genre}</td>
                  <td className="p-2">{w.duration ?? '—'}</td>
                  <td className="p-2">{w.composedAt ?? '—'}</td>
                  {!isUser && <td className="p-2">{w.registred ? 'Sí' : 'No'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}

export default DashboardPage