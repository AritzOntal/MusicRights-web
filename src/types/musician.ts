// Modelo de músico tal como lo devuelve el back en /api/v1/musicians
export interface Musician {
    id: number
    firstName: string | null
    lastName: string
    birthDate: string | null
    affiliated: boolean
    dni: string
    performanceFee: number | null
    affiliatedNumber: number
}

// Payload para POST /api/v1/musicians/me (el back genera el id)
export type NewMusician = Omit<Musician, 'id'>
