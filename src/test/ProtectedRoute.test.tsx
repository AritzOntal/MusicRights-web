import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../contexts/AuthContext'
import { TOKEN_STORAGE_KEY } from '../services/authService'

// construye un JWT "decodificable" por jwt-decode (sin firma válida real,
// solo necesitamos que el AuthProvider pueda leer sub/role/exp).
function makeToken(payload: object): string {
    const enc = (obj: object) =>
        btoa(JSON.stringify(obj))
            .replace(/=+$/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
    const header = enc({ alg: 'HS256', typ: 'JWT' })
    const body = enc(payload)
    return `${header}.${body}.firma-fake`
}

function renderApp(opts: { path?: string; allowedRoles?: ('USER' | 'MUSICIAN' | 'ADMIN')[] } = {}) {
    const { path = '/protected', allowedRoles } = opts
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<div>Pantalla de login</div>} />
                    <Route path="/dashboard" element={<div>Pantalla del dashboard</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute allowedRoles={allowedRoles}>
                                <div>Contenido protegido</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    )
}

describe('ProtectedRoute', () => {

    beforeEach(() => {
        localStorage.clear()
    })

    it('redirige a /login si no hay sesión', async () => {
        renderApp()

        await waitFor(() => {
            expect(screen.getByText(/pantalla de login/i)).toBeTruthy()
        })
        // Y NO se ve el contenido protegido
        expect(screen.queryByText(/contenido protegido/i)).toBeNull()
    })

    it('redirige a /dashboard si el rol no está permitido', async () => {
        // Token con rol USER pero la ruta solo permite ADMIN
        const exp = Math.floor(Date.now() / 1000) + 60 * 60 // 1 hora
        const token = makeToken({ sub: 'aritz', role: 'ROLE_USER', exp })
        localStorage.setItem(TOKEN_STORAGE_KEY, token)

        renderApp({ allowedRoles: ['ADMIN'] })

        await waitFor(() => {
            expect(screen.getByText(/pantalla del dashboard/i)).toBeTruthy()
        })
        expect(screen.queryByText(/contenido protegido/i)).toBeNull()
    })
})
