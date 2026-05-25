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

    if (!state.user) {
        // 1. Averiguamos si viene de la página de músico
        const mensaje = location.pathname === '/musicians/me'
            ? 'Te acabas de hacer músico. Vuelve a iniciar sesión para empezar a gestionar.'
            : null

        // 2. INYECTAMOS EL MENSAJE AQUÍ (en el state de la navegación)
        return <Navigate to="/login" state={{ info: mensaje }} replace />
    }

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
