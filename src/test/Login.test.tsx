import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import LoginPage from '../pages/LoginPage'
import * as authService from '../services/authService'

describe('LoginPage', () => {
    it('muestra error cuando las credenciales son incorrectas', async () => {
        // Esperamos que nuestro servicio falle con 401
        vi.spyOn(authService, 'login').mockRejectedValue({
            isAxiosError: true,
            response: { status: 401 },
        })

        //Componente DOM virtual necesario
        render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        )

        // Rellenamos el formulario y pulsamos Entrar
        fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'incorrecto' } })
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '1234' } })
        fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

        // Esperamos a que aparezca el mensaje de error
        await waitFor(() => {
            expect(screen.getByText(/usuario o contraseña incorrectos/i)).toBeTruthy()
        })
    })
})
