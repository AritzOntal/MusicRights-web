import { apiClient } from '../api/client'
import type { Concert } from '../types/concert'

export async function getAllConcerts(): Promise<Concert[]> {
    const response = await apiClient.get<Concert[]>('/v1/concerts')
    return response.data
}

export async function getConcertById(id: number): Promise<Concert> {
    const response = await apiClient.get<Concert>(`/v1/concerts/${id}`)
    return response.data
}

// Payload básico para crear un concierto.
// El músico lo asocia el back automáticamente desde el token (no se envía aquí).
export interface NewConcert {
    showTitle: string
    city: string
    province: string
    date: string            // 'YYYY-MM-DD'
    status: string | null
    performed: boolean
    ticketPrice: number
}

export async function createConcert(concert: NewConcert): Promise<Concert> {
    const response = await apiClient.post<Concert>('/v1/concerts', concert)
    return response.data
}
