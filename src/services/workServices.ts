import { apiClient } from '../api/client'
import type { Work } from '../types/work'

export async function getAllWorks(): Promise<Work[]> {
    const response = await apiClient.get<Work[]>('/v1/works')
    return response.data
}

export async function getWorkById(id: number): Promise<Work> {
    const response = await apiClient.get<Work>(`/v1/works/${id}`)
    return response.data
}