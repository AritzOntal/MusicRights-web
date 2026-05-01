import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { state } = useAuth()

    // 1) Aún cargando la sesión desde localStorage → mostramos placeholder
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

    // 3) Cargado y hay sesión → deja pasar
    return <>{children}</>
}

export default ProtectedRoute
