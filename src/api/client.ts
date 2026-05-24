import axios from 'axios'

const API_URL = 'https://hmooc20krj.execute-api.us-east-1.amazonaws.com/dev/api'
//Misma que AuthService para no crear bucle circular
const TOKEN_KEY = 'musicrights.token'


export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de REQUEST: añade el JWT a cada petición si existe
//El parametro config contiene todo el contenido (URL, HEADERS....)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de RESPONSE
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      //Borramos el token para que el AuthContex la próxima vez lo vea vacío
      localStorage.removeItem(TOKEN_KEY)
    }
    //Devolvemos el error para que lo pille el try catch de la llamada.
    return Promise.reject(error)
  },
)

//ASI LOS SERVICES NO SE TIENE QUE PREOCUPARSE POR LA CABECERA.
