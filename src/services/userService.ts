import { apiClient } from '../api/client'
import type { User, UserRole } from '../types/user'

export async function getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/v1/users')
    return response.data
}

// El patch del back
export async function updateUserRole(id: number, role: UserRole): Promise<User> {
    const response = await apiClient.patch<User>(`/v1/users/${id}/role`, role, {
        headers: { 'Content-Type': 'text/plain' },
    })
    return response.data
}
