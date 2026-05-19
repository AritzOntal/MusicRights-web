// Modelo de usuario del back
export interface User {
    id: number
    username: string
    role: string
    musician?: { id: number } | null
}

// Roles válidos para asiganar desde AdminPage
export const USER_ROLES = ['ROLE_USER', 'ROLE_MUSICIAN', 'ROLE_ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]
