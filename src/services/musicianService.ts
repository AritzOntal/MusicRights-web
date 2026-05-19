import { apiClient } from '../api/client'
import type { Musician, NewMusician } from '../types/musician'

// Convierte al usuario logueado en músico
// la asocia a su User y sube su rol a ROLE_MUSICIAN en el back.
export async function becomeMusician(input: NewMusician): Promise<Musician> {
    const response = await apiClient.post<Musician>('/v1/musicians/me', input)
    return response.data
}
