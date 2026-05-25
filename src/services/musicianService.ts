import { apiClient } from '../api/client'
import type { Musician, NewMusician } from '../types/musician'

// Convierte al usuario logueado en músico
// la asocia a su User y sube su rol a ROLE_MUSICIAN en el back.
export async function becomeMusician(input: NewMusician): Promise<Musician> {
    const response = await apiClient.post<Musician>('/v1/musicians/me', input)
    return response.data
}

// Obtiene un músico específico por su ID
export async function getMusicianById(id: number): Promise<Musician> {
    const response = await apiClient.get<Musician>(`/v1/musicians/${id}`)
    return response.data
}

// NUEVA: Obtiene la lista completa de músicos desde el backend
// Es la que usará AdminPage para pintar los 10 músicos del script
export async function getAllMusicians(): Promise<Musician[]> {
    const response = await apiClient.get<Musician[]>('/v1/musicians')
    return response.data
}