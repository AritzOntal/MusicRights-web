import type { Concert } from './concert'

// Documento generado (PDF de SGAE) tal como lo devuelve /v1/documents/mine
export interface GeneratedDocument {
    id: number
    type: string
    filename: string
    size: number | null
    createAt: string | null          // fecha de generación 'YYYY-MM-DD'
    complete: boolean | null
    completionPercentage: number
    concert: Concert | null
}
