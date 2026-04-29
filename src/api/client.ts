import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8085/api'

// Preconfiguracion que hace axios para las llamadas
export const apiClient = axios.create({
  baseURL: API_URL,
// Cabecera por defecto en las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
})