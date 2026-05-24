import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, updateUserRole } from '../services/userService'
import { USER_ROLES } from '../types/user'
import type { User, UserRole } from '../types/user'
import AppLayout from '../components/AppLayout'

type CounterView = null | 'users' | 'musicians'

function AdminPage() {
    const { state } = useAuth()

    // Cargamos los usuarios una vez y los guardamos en memoria; la búsqueda es local.
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [view, setView] = useState<CounterView>(null)

    useEffect(() => {
        getAllUsers()
            .then((data) => {
                setUsers(data)
                setError(null)
            })
            .catch((err) => {
                setError('No se pudieron cargar los usuarios')
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleRoleChange(user: User, newRole: UserRole) {
        const previousRole = user.role

        // Cambiamos en pantalla antes de tener confirmación
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)))
        setFeedback(null)

        try {
            await updateUserRole(user.id, newRole)
            setFeedback(`Rol de "${user.username}" actualizado a ${newRole}`)
        } catch (err) {
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: previousRole } : u)))

            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setFeedback('El usuario ya no existe')
            } else {
                setFeedback('No se pudo actualizar el rol')
            }
        }
    }

    function toggleView(v: 'users' | 'musicians') {
        setView((prev) => (prev === v ? null : v))
    }

    // Métricas
    const totalUsers = users.length
    const totalMusicians = users.filter((u) => u.musician).length

    const q = search.trim().toLowerCase()
    // Resultados de búsqueda (tarjetas)
    const searchResults = q ? users.filter((u) => u.username.toLowerCase().includes(q)) : []
    // Lista a mostrar en la tabla al pinchar un contador
    const tableUsers = view === 'musicians' ? users.filter((u) => u.musician) : users

    // Un <select> de rol reutilizable
    function roleSelect(u: User) {
        const isSelf = state.user?.username === u.username
        return (
            <select
                aria-label={`Rol de ${u.username}`}
                value={u.role}
                disabled={isSelf}
                onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                className="input h-9 w-auto"
            >
                {USER_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
        )
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl">Usuarios</h1>
                    <p className="text-sm text-muted mt-1">
                        Hola, <span className="text-ink font-medium">{state.user?.username}</span>. Busca un usuario o pincha un contador para gestionar roles.
                    </p>
                </div>

                {/* Contadores clicables: despliegan la tabla correspondiente */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
                    <button
                        onClick={() => toggleView('users')}
                        className={`text-left rounded-xl border p-4 transition-colors ${
                            view === 'users' ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-line-strong'
                        }`}
                    >
                        <div className="text-xs text-muted">Total de usuarios</div>
                        <div className="font-serif text-2xl font-semibold mt-1">{totalUsers}</div>
                    </button>
                    <button
                        onClick={() => toggleView('musicians')}
                        className={`text-left rounded-xl border p-4 transition-colors ${
                            view === 'musicians' ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-line-strong'
                        }`}
                    >
                        <div className="text-xs text-muted">Total de músicos</div>
                        <div className="font-serif text-2xl font-semibold mt-1">{totalMusicians}</div>
                    </button>
                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar usuario por nombre…"
                    className="input"
                />

                {feedback && (
                    <p className="text-sm bg-paper border border-line p-3 rounded-xl text-ink">
                        {feedback}
                    </p>
                )}

                {loading && <p className="text-muted">Cargando usuarios…</p>}
                {error && <p className="text-red-600">{error}</p>}

                {/* 1) Si hay búsqueda: resultados en tarjetas (sin tabla) */}
                {!loading && !error && q !== '' && (
                    searchResults.length === 0 ? (
                        <div className="card p-10 text-center text-muted">
                            No hay usuarios que coincidan con «{search.trim()}».
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {searchResults.map((u) => (
                                <div key={u.id} className="card p-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">
                                            {u.username}
                                            {state.user?.username === u.username && (
                                                <span className="ml-2 text-xs text-subtle">(tú)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {u.musician ? 'Tiene ficha de músico' : 'Sin ficha de músico'} · ID {u.id}
                                        </p>
                                    </div>
                                    {roleSelect(u)}
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* 2) Sin búsqueda y con contador activo: tabla de la categoría */}
                {!loading && !error && q === '' && view !== null && (
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    <th className="p-3 text-left font-medium">ID</th>
                                    <th className="p-3 text-left font-medium">Usuario</th>
                                    <th className="p-3 text-left font-medium">Rol</th>
                                    <th className="p-3 text-left font-medium">Músico</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableUsers.map((u) => (
                                    <tr key={u.id} className="border-t border-line">
                                        <td className="p-3 text-muted">{u.id}</td>
                                        <td className="p-3 font-medium">
                                            {u.username}
                                            {state.user?.username === u.username && (
                                                <span className="ml-2 text-xs text-subtle">(tú)</span>
                                            )}
                                        </td>
                                        <td className="p-3">{roleSelect(u)}</td>
                                        <td className="p-3 text-muted">{u.musician ? 'Sí' : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3) Estado inicial: ni búsqueda ni contador */}
                {!loading && !error && q === '' && view === null && (
                    <div className="card p-8 text-center text-muted">
                        Busca un usuario por su nombre, o pincha un contador para ver la lista completa.
                    </div>
                )}
            </div>
        </AppLayout>
    )
}

export default AdminPage
