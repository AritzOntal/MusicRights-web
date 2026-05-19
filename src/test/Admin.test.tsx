import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AdminPage from '../pages/AdminPage'
import { AuthProvider } from '../contexts/AuthContext'
import * as userService from '../services/userService'
import type { User } from '../types/user'

//Envuelve el AdminPage con todo lo que necesita (Router + AuthProvider)
function renderPage() {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <AdminPage />
            </AuthProvider>
        </BrowserRouter>
    )
}

describe('AdminPage', () => {

    // Limpiamos localStorage por si quedó token de otro test
    beforeEach(() => {
        localStorage.clear()
    })

    it('muestra el listado de usuarios cuando el servicio responde bien', async () => {
        const mockUsers: User[] = [
            { id: 1, username: 'Aritz', role: 'ROLE_USER' },
            { id: 2, username: 'Juan',   role: 'ROLE_MUSICIAN' },
        ]
        vi.spyOn(userService, 'getAllUsers').mockResolvedValue(mockUsers)

        renderPage()

        await waitFor(() => {
            expect(screen.getByText('Aritz')).toBeTruthy()
        })
        expect(screen.getByText('Juan')).toBeTruthy()
    })

    it('cambia el rol de un usuario y llama al servicio', async () => {
        const mockUsers: User[] = [
            { id: 1, username: 'alice', role: 'ROLE_USER' },
        ]
        vi.spyOn(userService, 'getAllUsers').mockResolvedValue(mockUsers)
        const updateSpy = vi.spyOn(userService, 'updateUserRole').mockResolvedValue({
            ...mockUsers[0],
            role: 'ROLE_MUSICIAN',
        })

        renderPage()

        // Esperamos a que aparezca el select del usuario
        const select = await screen.findByLabelText(/rol de alice/i)

        fireEvent.change(select, { target: { value: 'ROLE_MUSICIAN' } })

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledWith(1, 'ROLE_MUSICIAN')
        })
        // Y aparece el feedback de éxito
        await waitFor(() => {
            expect(screen.getByText(/rol de "alice" actualizado a ROLE_MUSICIAN/i)).toBeTruthy()
        })
    })

    it('revierte el rol si el back devuelve error', async () => {
        const mockUsers: User[] = [
            { id: 1, username: 'alice', role: 'ROLE_USER' },
        ]
        vi.spyOn(userService, 'getAllUsers').mockResolvedValue(mockUsers)
        vi.spyOn(userService, 'updateUserRole').mockRejectedValue({
            isAxiosError: true,
            response: { status: 500 },
        })

        renderPage()

        const select = await screen.findByLabelText(/rol de alice/i) as HTMLSelectElement

        fireEvent.change(select, { target: { value: 'ROLE_ADMIN' } })

        // Mensaje de error
        await waitFor(() => {
            expect(screen.getByText(/no se pudo actualizar el rol/i)).toBeTruthy()
        })
        // Y el select vuelve a su valor original
        expect(select.value).toBe('ROLE_USER')
    })
})
