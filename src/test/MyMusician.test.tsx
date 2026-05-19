import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import MyMusicianPage from '../pages/MyMusicianPage'
import { AuthProvider } from '../contexts/AuthContext'
import * as musicianService from '../services/musicianService'
import type { Musician } from '../types/musician'

// Añadimos rutas /login y /dashboard como placeholders para verificar las navegaciones.
function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/musicians/me']}>
            <AuthProvider>
                <Routes>
                    <Route path="/musicians/me" element={<MyMusicianPage />} />
                    <Route path="/login" element={<div>Inicio de sesión</div>} />
                    <Route path="/dashboard" element={<div>Pantalla del dashboard</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    )
}

describe('MyMusicianPage', () => {

    beforeEach(() => {
        localStorage.clear()
    })

    it('muestra error si el apellido está vacío y no llama al servicio', async () => {
        const spy = vi.spyOn(musicianService, 'becomeMusician').mockResolvedValue({} as Musician)

        renderPage()

        fireEvent.change(screen.getByLabelText(/dni/i), { target: { value: '12345678A' } })

        fireEvent.click(screen.getByRole('button', { name: /hazme músico/i }))

        await waitFor(() => {
            expect(screen.getByText(/el apellido es obligatorio/i)).toBeTruthy()
        })
        expect(spy).not.toHaveBeenCalled()
    })

    it('muestra error si el DNI no tiene el formato correcto', async () => {
        const spy = vi.spyOn(musicianService, 'becomeMusician').mockResolvedValue({} as Musician)

        renderPage()

        fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Pérez' } })
        fireEvent.change(screen.getByLabelText(/dni/i), { target: { value: '1234' } })

        fireEvent.click(screen.getByRole('button', { name: /hazme músico/i }))

        await waitFor(() => {
            expect(screen.getByText(/dni inválido/i)).toBeTruthy()
        })
        expect(spy).not.toHaveBeenCalled()
    })

    it('crea el músico y llama al servicio con el payload correcto', async () => {
        const created: Musician = {
            id: 10,
            firstName: 'Aritz',
            lastName: 'Pérez',
            dni: '12345678A',
            birthDate: null,
            affiliated: false,
            performanceFee: null,
            affiliatedNumber: 0,
        }
        const spy = vi.spyOn(musicianService, 'becomeMusician').mockResolvedValue(created)

        renderPage()

        fireEvent.change(screen.getByLabelText(/^nombre$/i),    { target: { value: 'Aritz' } })
        fireEvent.change(screen.getByLabelText(/apellido/i),    { target: { value: 'Pérez' } })
        fireEvent.change(screen.getByLabelText(/dni/i),         { target: { value: '12345678A' } })

        fireEvent.click(screen.getByRole('button', { name: /hazme músico/i }))

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })
        expect(spy).toHaveBeenCalledWith({
            firstName: 'Aritz',
            lastName: 'Pérez',
            dni: '12345678A',
            birthDate: null,
            affiliated: false,
            performanceFee: null,
            affiliatedNumber: 0,
        })

        // Tras éxito navega a /login (forzando relogin con el nuevo JWT)
        await waitFor(() => {
            expect(screen.getByText(/inicio de sesión/i)).toBeTruthy()
        })
    })

    it('muestra mensaje si el back devuelve 409 (ya tiene ficha)', async () => {
        vi.spyOn(musicianService, 'becomeMusician').mockRejectedValue({
            isAxiosError: true,
            response: { status: 409 },
        })

        renderPage()

        fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Pérez' } })
        fireEvent.change(screen.getByLabelText(/dni/i),      { target: { value: '12345678A' } })

        fireEvent.click(screen.getByRole('button', { name: /hazme músico/i }))

        await waitFor(() => {
            expect(screen.getByText(/ya tienes una ficha de músico/i)).toBeTruthy()
        })
    })
})
