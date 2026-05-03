import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWorks } from '../hooks/useWorks'
import * as workServices from '../services/workServices'
import type { Work } from '../types/work'

describe('useWorks', () => {

    it('devuelve las obras cuando el servicio responde bien', async () => {
        // ARRANGE: datos de prueba y mock del servicio
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

        // primero cargando antes de que se ejecute .then
        expect(result.current.loading).toBe(true)

        // cuando termina, tenemos los datos y sin error
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })
        expect(result.current.works).toEqual(mockWorks)
        expect(result.current.error).toBeNull()
    })

})
