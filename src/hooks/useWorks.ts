import { useEffect, useState } from 'react'
import { getAllWorks } from '../services/workServices'
import type { Work } from '../types/work'

interface UseWorksResult {
    works: Work[]
    loading: boolean
    error: string | null
}

export function useWorks(): UseWorksResult {
    const [works, setWorks] = useState<Work[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getAllWorks()
            .then((data) => {
                setWorks(data)
                setError(null)
            })
            .catch((err) => {
                setError('No se pudieron cargar las obras')
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

    return { works, loading, error }
}