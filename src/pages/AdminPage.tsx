import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, updateUserRole } from '../services/userService'
import { USER_ROLES } from '../types/user'
import type { User, UserRole } from '../types/user'

function AdminPage() {
    const navigate = useNavigate()
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
        <main className="min-h-screen p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-4">

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-red-700">Zona de administración</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-blue-700 underline"
                    >
                        ← Volver al dashboard
                    </button>
                </div>

                <p className="text-slate-600">
                    Hola, <b>{state.user?.username}</b>. Gestiona los roles de los usuarios.
                </p>

                {feedback && (
                    <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded">
                        {feedback}
                    </p>
                )}

                {loading && <p>Cargando usuarios...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && users.length === 0 && <p>No hay usuarios.</p>}

                {!loading && !error && users.length > 0 && (
                    <table className="w-full bg-white rounded shadow border">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 text-left">ID</th>
                                <th className="p-2 text-left">Usuario</th>
                                <th className="p-2 text-left">Rol</th>
                                <th className="p-2 text-left">Músico</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                // No permitimos que el admin se cambie a sí mismo el rol
                                const isSelf = state.user?.username === u.username
                                return (
                                    <tr key={u.id} className="border-t">
                                        <td className="p-2">{u.id}</td>
                                        <td className="p-2">{u.username}</td>
                                        <td className="p-2">
                                            <select
                                                aria-label={`Rol de ${u.username}`}
                                                value={u.role}
                                                disabled={isSelf}
                                                onChange={(e) =>
                                                    handleRoleChange(u, e.target.value as UserRole)
                                                }
                                                className="border rounded px-2 py-1"
                                            >
                                                {USER_ROLES.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            {isSelf && (
                                                <span className="ml-2 text-xs text-slate-500">(tú)</span>
                                            )}
                                        </td>
                                        <td className="p-2">{u.musician ? 'Sí' : '—'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    )
}

export default AdminPage
