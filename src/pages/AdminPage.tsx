import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, updateUserRole } from '../services/userService'
// IMPORTANTE: Asegúrate de tener importada tu función para traer músicos de la API
import { getAllMusicians } from '../services/musicianService'
import { USER_ROLES } from '../types/user'
import type { User, UserRole } from '../types/user'
import AppLayout from '../components/AppLayout'

type CounterView = null | 'users' | 'musicians'

function AdminPage() {
    const { state } = useAuth()

    // Estados independientes para usuarios y músicos de la base de datos
    const [users, setUsers] = useState<User[]>([])
    const [musicians, setMusicians] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [view, setView] = useState<CounterView>(null)

    useEffect(() => {
        // Ejecutamos ambas peticiones en paralelo al cargar la página
        Promise.all([getAllUsers(), getAllMusicians()])
            .then(([usersData, musiciansData]) => {
                setUsers(usersData)
                setMusicians(musiciansData)
                setError(null)
            })
            .catch((err) => {
                setError('No se pudieron cargar los datos del servidor')
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleRoleChange(user: User, newRole: UserRole) {
        const previousRole = user.role

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

    // Métricas reales conectadas a sus respectivas tablas de MariaDB
    const totalUsers = users.length
    const totalMusicians = musicians.length // Ahora sí lee los 10 del script

    const q = search.trim().toLowerCase()

    // Resultados de búsqueda local por nombre de usuario
    const searchResults = q ? users.filter((u) => u.username.toLowerCase().includes(q)) : []

    // Control de vista activa
    const isMusicianView = view === 'musicians'

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
                    <h1 className="text-3xl">Panel de administración</h1>
                    <p className="text-sm text-muted mt-1">
                        Hola, <span className="text-ink font-medium">{state.user?.username}</span>. Gestiona los usuarios o revisa los músicos registrados.
                    </p>
                </div>

                {/* Contadores */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
                    <button
                        onClick={() => toggleView('users')}
                        className={`text-left rounded-xl border p-4 transition-colors ${view === 'users' ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-line-strong'
                            }`}
                    >
                        <div className="text-xs text-muted">Total de usuarios</div>
                        <div className="font-serif text-2xl font-semibold mt-1">{totalUsers}</div>
                    </button>
                    <button
                        onClick={() => toggleView('musicians')}
                        className={`text-left rounded-xl border p-4 transition-colors ${view === 'musicians' ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-line-strong'
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

                {loading && <p className="text-muted">Cargando datos del sistema…</p>}
                {error && <p className="text-red-600">{error}</p>}

                {/* 1) Búsqueda activa */}
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

                {/* 2) Tabla dinámica según el botón seleccionado */}
                {!loading && !error && q === '' && view !== null && (
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    <th className="p-3 text-left font-medium">ID</th>
                                    <th className="p-3 text-left font-medium">
                                        {isMusicianView ? 'Nombre Completo' : 'Usuario'}
                                    </th>
                                    <th className="p-3 text-left font-medium">
                                        {isMusicianView ? 'DNI' : 'Rol'}
                                    </th>
                                    <th className="p-3 text-left font-medium">
                                        {isMusicianView ? 'Email de Contacto' : 'Ficha Músico'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isMusicianView
                                    ? musicians.map((m) => (
                                        <tr key={m.id} className="border-t border-line">
                                            <td className="p-3 text-muted">{m.id}</td>
                                            <td className="p-3 font-medium">{m.firstName} {m.lastName}</td>
                                            <td className="p-3 text-ink">{m.dni}</td>
                                            <td className="p-3 text-muted">{m.email || '—'}</td>
                                        </tr>
                                    ))
                                    : users.map((u) => (
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
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3) Estado inicial vacio */}
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