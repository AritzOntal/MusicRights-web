import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWorks } from '../hooks/useWorks'
import * as workServices from '../services/workServices'
import type { Work } from '../types/work'

describe('useWorks', () => {

    it('devuelve las obras cuando el servicio responde bien', async () => {
        const mockWorks: Work[] = [
            {
                id: 1,
                title: 'Test',
                isrc: 'X',
                genre: 'Pop',
                duration: 100,
                composedAt: '2020',
                registred: true,
            },
        ]
        vi.spyOn(workServices, 'getAllWorks').mockResolvedValue(mockWorks)

        // renderizamos el hook de forma aislada
        const { result } = renderHook(() => useWorks())

        // cargando antes de que se ejecute .then
        expect(result.current.loading).toBe(true)

        // cuando termina, tenemos los datos y sin error
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })
        expect(result.current.works).toEqual(mockWorks)
        expect(result.current.error).toBeNull()
    })

    it('devuelve mensaje de error cuando el servicio falla', async () => {
        // Mock que falla
        vi.spyOn(workServices, 'getAllWorks').mockRejectedValue(new Error('boom'))

        const { result } = renderHook(() => useWorks())

        // Esperamos a que el hook termine de cargar
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        // No tiene obras y mensaje de error
        expect(result.current.works).toEqual([])
        expect(result.current.error).toMatch(/no se pudieron cargar las obras/i)
    })

})
