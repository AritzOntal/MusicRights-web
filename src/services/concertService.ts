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

// Payload de edición. Incluye TODOS los campos que mapea ConcertService.edit
// en el back (si se omite alguno, el back lo pondría a null). El músico NO se
// envía: el back conserva el dueño actual.
export interface UpdateConcert {
    showTitle: string
    city: string
    province: string
    date: string
    status: string | null
    performed: boolean
    ticketPrice: number
    longitude: number | null
    latitude: number | null
    time: string | null
    venueName: string | null
    venueAddress: string | null
    capacity: number | null
    venueOwner: string | null
    performers: string | null
    ticketClass: string | null
    totalTickets: number | null
    tariffType: string | null
    works: { id: number }[]
}

export async function updateConcert(id: number, concert: UpdateConcert): Promise<Concert> {
    const response = await apiClient.put<Concert>(`/v1/concerts/${id}`, concert)
    return response.data
}

export async function deleteConcert(id: number): Promise<void> {
    await apiClient.delete(`/v1/concerts/${id}`)
}

// Respuesta al generar el documento SGAE (metadatos + URL de descarga prefirmada)
export interface SgaeDocumentResponse {
    id: number
    filename: string
    size: number
    completionPercentage: number
    complete: boolean
    downloadUrl: string
}

// Genera el PDF de SGAE del concierto en el backend (lo sube a S3) y devuelve la URL de descarga
export async function generateSgaeDocument(concertId: number): Promise<SgaeDocumentResponse> {
    const response = await apiClient.post<SgaeDocumentResponse>(`/v1/concerts/${concertId}/sgae-document`)
    return response.data
}
