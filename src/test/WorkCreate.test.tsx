import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import WorkCreatePage from '../pages/WorkCreatePage'
import * as workServices from '../services/workServices'
import type { Work } from '../types/work'

// Helper: monta WorkCreatePage detrás de la ruta /works/new
function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/works/new']}>
            <Routes>
                <Route path="/works/new" element={<WorkCreatePage />} />
                {/* Ruta destino tras crear, para que navigate('/works/:id') no falle */}
                <Route path="/works/:id" element={<div>Detalle de la obra</div>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('WorkCreatePage', () => {

    it('muestra error si el ISRC es inválido y no llama al servicio', async () => {
        const spy = vi.spyOn(workServices, 'createWork').mockResolvedValue({} as Work)

        renderPage()

        fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Mi obra' } })
        fireEvent.change(screen.getByLabelText(/isrc/i),   { target: { value: 'XXX' } })
        fireEvent.change(screen.getByLabelText(/género/i), { target: { value: 'Pop' } })

        fireEvent.click(screen.getByRole('button', { name: /crear obra/i }))

        await waitFor(() => {
            expect(screen.getByText(/isrc inválido/i)).toBeTruthy()
        })
        // No debe haberse llamado al back con datos inválidos
        expect(spy).not.toHaveBeenCalled()
    })

    it('crea la obra y llama al servicio con el payload correcto', async () => {
        const created: Work = {
            id: 42,
            title: 'Mi obra',
            isrc: 'ESABC2300123',
            genre: 'Pop',
            duration: 200,
            composedAt: null,
            registred: false,
        }
        const spy = vi.spyOn(workServices, 'createWork').mockResolvedValue(created)

        renderPage()

        fireEvent.change(screen.getByLabelText(/título/i),  { target: { value: 'Mi obra' } })
        fireEvent.change(screen.getByLabelText(/isrc/i),    { target: { value: 'ESABC2300123' } })
        fireEvent.change(screen.getByLabelText(/género/i),  { target: { value: 'Pop' } })
        fireEvent.change(screen.getByLabelText(/duración/i),{ target: { value: '200' } })

        fireEvent.click(screen.getByRole('button', { name: /crear obra/i }))

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })
        expect(spy).toHaveBeenCalledWith({
            title: 'Mi obra',
            isrc: 'ESABC2300123',
            genre: 'Pop',
            duration: 200,
            composedAt: null,
            registred: false,
        })

        // Después de crear se navega a /works/42 → debe verse el placeholder de detalle
        await waitFor(() => {
            expect(screen.getByText(/detalle de la obra/i)).toBeTruthy()
        })
    })

    it('muestra mensaje si el back devuelve 403', async () => {
        vi.spyOn(workServices, 'createWork').mockRejectedValue({
            isAxiosError: true,
            response: { status: 403 },
        })

        renderPage()

        fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Mi obra' } })
        fireEvent.change(screen.getByLabelText(/isrc/i),   { target: { value: 'ESABC2300123' } })
        fireEvent.change(screen.getByLabelText(/género/i), { target: { value: 'Pop' } })

        fireEvent.click(screen.getByRole('button', { name: /crear obra/i }))

        await waitFor(() => {
            expect(screen.getByText(/no tienes permisos para crear obras/i)).toBeTruthy()
        })
    })
})
