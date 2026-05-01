export interface Work {
    id: number
    title: string
    isrc: string
    genre: string
    duration: number | null
    composedAt: string | null
    registred: boolean
}