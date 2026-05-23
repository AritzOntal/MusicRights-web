import { useEffect, useState } from 'react'
import { getAllConcerts } from '../services/concertService'
import type { Concert } from '../types/concert'

interface UseConcertsResult {
    concerts: Concert[]
    loading: boolean
    error: string | null
}

export function useConcerts(): UseConcertsResult {
    const [concerts, setConcerts] = useState<Concert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getAllConcerts()
            .then((data) => {
                setConcerts(data)
                setError(null)
            })
            .catch((err) => {
                setError('No se pudieron cargar los conciertos')
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

    return { concerts, loading, error }
}
