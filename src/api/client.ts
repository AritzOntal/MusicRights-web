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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Borramos el token para cerrar la sesión
      localStorage.removeItem(TOKEN_KEY)

      // 2. Comprobamos si el error viene de la petición de "hacerse músico"
      // Revisa si la URL de tu API para hacerse músico contiene la palabra 'musician' o similar
      if (error.config?.url?.includes('musician')) {
        const searchParams = new URLSearchParams({ 
          info: 'Te acabas de hacer músico. Vuelve a iniciar sesión para empezar a gestionar.' 
        })
        
        // Redirigimos por código asignando los parámetros directamente a la URL
        window.location.href = `/login?${searchParams.toString()}`
        return Promise.reject(error)
      }
    }
    
    // Devolvemos el error para que lo pille el try catch de la llamada estándar
    return Promise.reject(error)
  },
)

//ASI LOS SERVICES NO SE TIENE QUE PREOCUPARSE POR LA CABECERA.
