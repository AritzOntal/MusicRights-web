import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types/auth'


interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: Role[]
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { state } = useAuth()

    // 1) Antes de nada cuando este cargando, mostramos placeholder
    if (state.isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Cargando...</p>
            </main>
        )
    }

    // 2) Cargado y no hay sesión → al login
    if (!state.user) {
        return <Navigate to="/login" replace />
    }

    //En caso de que ROLE sea undefined, redirigimos a dashboard (así siempre tendran acceso lo logueados)
    if (allowedRoles && !allowedRoles.includes(state.user.role)) {
        return <Navigate to="/dashboard" replace />
    }


    // 3) Cargado y hay sesión → deja pasar
    return <>{children}</>
}

export default ProtectedRoute
