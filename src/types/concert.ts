import type { Musician } from './musician'
import type { Work } from './work'

// Modelo de concierto tal como lo devuelve el back en /api/v1/concerts
export interface Concert {
    id: number
    // Campos básicos (los del formulario de este paso)
    showTitle: string
    city: string
    province: string
    date: string            // 'YYYY-MM-DD'
    status: string | null
    performed: boolean
    ticketPrice: number

    // Campos del formulario de SGAE (se rellenarán en un paso posterior)
    longitude?: number | null
    latitude?: number | null
    time?: string | null            // 'HH:mm'
    venueName?: string | null
    venueAddress?: string | null
    capacity?: number | null
    venueOwner?: string | null
    performers?: string | null
    ticketClass?: string | null
    totalTickets?: number | null
    tariffType?: string | null

    works?: Work[]
    musician?: Musician | null
}
