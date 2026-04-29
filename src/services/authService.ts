//Traemos el cliente que hemos importado
import { apiClient } from '../api/client'

export async function register(username: string, password: string): Promise<void> {
    //utiliza el cliente y con axios hace la llamada
  await apiClient.post('/v1/users', { username, password })
}