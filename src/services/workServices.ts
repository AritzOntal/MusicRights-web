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

// Omitimos ide porque lo genera el Back
export type NewWork = Omit<Work, 'id'>

export async function createWork(work: NewWork): Promise<Work> {
    const response = await apiClient.post<Work>('/v1/works', work)
    return response.data
}

export async function deleteWork(id: number): Promise<void> {
    await apiClient.delete(`/v1/works/${id}`)
}