import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, updateUserRole } from '../services/userService'
import { USER_ROLES } from '../types/user'
import type { User, UserRole } from '../types/user'
import AppLayout from '../components/AppLayout'

function AdminPage() {
    const { state } = useAuth()

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // Mensaje informativo
    const [feedback, setFeedback] = useState<string | null>(null)

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

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl">Administración</h1>
                    <p className="text-sm text-muted mt-1">
                        Hola, <span className="text-ink font-medium">{state.user?.username}</span>. Gestiona los roles de los usuarios.
                    </p>
                </div>

                {feedback && (
                    <p className="text-sm bg-paper border border-line p-3 rounded-xl text-ink">
                        {feedback}
                    </p>
                )}

                {loading && <p className="text-muted">Cargando usuarios…</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && users.length === 0 && (
                    <div className="card p-10 text-center text-muted">No hay usuarios.</div>
                )}

                {!loading && !error && users.length > 0 && (
                    <div className="card overflow-hidden">
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
                                {users.map((u) => {
                                    // No permitimos que el admin se cambie a sí mismo el rol
                                    const isSelf = state.user?.username === u.username
                                    return (
                                        <tr key={u.id} className="border-t border-line">
                                            <td className="p-3 text-muted">{u.id}</td>
                                            <td className="p-3 font-medium">{u.username}</td>
                                            <td className="p-3">
                                                <select
                                                    aria-label={`Rol de ${u.username}`}
                                                    value={u.role}
                                                    disabled={isSelf}
                                                    onChange={(e) =>
                                                        handleRoleChange(u, e.target.value as UserRole)
                                                    }
                                                    className="input h-9 w-auto inline-block"
                                                >
                                                    {USER_ROLES.map((r) => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                                {isSelf && (
                                                    <span className="ml-2 text-xs text-subtle">(tú)</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-muted">{u.musician ? 'Sí' : '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}

export default AdminPage
