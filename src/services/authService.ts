//Traemos el cliente que hemos importado
import { apiClient } from '../api/client'

export const TOKEN_STORAGE_KEY = 'musicrights.token'

export async function register(username: string, password: string): Promise<void> {
    //utiliza el cliente y con axios hace la llamada
  await apiClient.post('/v1/users', { username, password })
}

export async function login(username: string, password: string): Promise<string> {
  const response = await apiClient.post('/auth/login', { username, password })
  return response.data
}

