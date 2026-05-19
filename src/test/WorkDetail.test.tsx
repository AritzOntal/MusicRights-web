import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import WorkDetailPage from '../pages/WorkDetailPage'
import * as workServices from '../services/workServices'
import type { Work } from '../types/work'

// Helper: monta WorkDetailPage detrás de la ruta /works/:id
// con la URL que le pasemos. Usamos MemoryRouter para no depender del navegador.
function renderAt(url: string) {
    return render(
        <MemoryRouter initialEntries={[url]}>
            <Routes>
                <Route path="/works/:id" element={<WorkDetailPage />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('WorkDetailPage', () => {

    it('muestra los datos de la obra cuando el servicio responde bien', async () => {
        const mockWork: Work = {
            id: 7,
            title: 'Claro de Luna',
            isrc: 'ESABC1234567',
            genre: 'Clásica',
            duration: 360,
            composedAt: '1801',
            registred: true,
        }
        vi.spyOn(workServices, 'getWorkById').mockResolvedValue(mockWork)

        renderAt('/works/7')

        // Esperamos a que el título cargue
        await waitFor(() => {
            expect(screen.getByText('Claro de Luna')).toBeTruthy()
        })

        // Y comprobamos que aparecen los demás campos
        expect(screen.getByText('ESABC1234567')).toBeTruthy()
        expect(screen.getByText('Clásica')).toBeTruthy()
        expect(screen.getByText('Sí')).toBeTruthy()
    })

    it('muestra mensaje de error si la obra no existe (404)', async () => {
        vi.spyOn(workServices, 'getWorkById').mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 },
        })

        renderAt('/works/999')

        await waitFor(() => {
            expect(screen.getByText(/la obra no existe/i)).toBeTruthy()
        })
    })
})
