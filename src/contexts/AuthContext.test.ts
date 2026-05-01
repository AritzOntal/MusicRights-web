import { describe, it, expect } from 'vitest'
import { authReducer } from './AuthContext'

describe('authReducer', () => {

    it('INICIADO sin payload deja el state vacío con isLoading false', () => {
        const initialState = { user: null, 
            token: null, 
            isLoading: true }

        const action = { type: 'INITIALIZE' as const, payload: null }

        const newState = authReducer(initialState, action)

        expect(newState).toEqual({ user: null, token: null, isLoading: false })
    })

    it('LOGIN guarda user y token en el state', () => {
        const initialState = { user: null, 
            token: null, 
            isLoading: false 
        }

        const action = {
            type: 'LOGIN' as const,
            payload: {
                user: { username: 'aritz', role: 'USER' as const },
                token: 'jwt-fake',
            },
        }

        const newState = authReducer(initialState, action)

        expect(newState.user).toEqual({ username: 'aritz', role: 'USER' })
        expect(newState.token).toBe('jwt-fake')
        expect(newState.isLoading).toBe(false)
    })

    it('LOGOUT limpia user y token', () => {
        const initialState = {
            user: { username: 'aritz', role: 'ADMIN' as const },
            token: 'jwt-fake',
            isLoading: false,
        }
        const action = { type: 'LOGOUT' as const }

        const newState = authReducer(initialState, action)

        expect(newState.user).toBeNull()
        expect(newState.token).toBeNull()
        expect(newState.isLoading).toBe(false)
    })

})