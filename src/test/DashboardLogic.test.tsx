import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardPage from '../pages/DashboardPage'
import { AuthProvider } from '../contexts/AuthContext'
import * as useWorksHook from '../hooks/useWorks'
import type { Work } from '../types/work'

describe('DashboardPage', () => {
    it('filtra la tabla según la búsqueda', () => {
        const mockWorks: Work[] = [
            { id: 1, title: 'Sonata Ártica', isrc: 'A', genre: 'Metal',   duration: 300, composedAt: '2020', registred: true },
            { id: 2, title: 'Claro de Luna', isrc: 'B', genre: 'Clásica', duration: 400, composedAt: '1801', registred: true },
        ]

        // El hook devuelve los datos de prueba
        vi.spyOn(useWorksHook, 'useWorks').mockReturnValue({
            works: mockWorks,
            loading: false,
            error: null,
        })

        render(
            <AuthProvider>
                <DashboardPage />
            </AuthProvider>
        )

        // Escribimos en el buscador
        fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'Ártica' } })

        // Solo debe verse la obra que coincide
        expect(screen.getByText('Sonata Ártica')).toBeTruthy()
        expect(screen.queryByText('Claro de Luna')).toBeNull()
    })
})
