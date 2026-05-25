import { createContext, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser, JwtPayload, Role } from '../types/auth'
import { TOKEN_STORAGE_KEY } from '../services/authService'
import { useNavigate } from 'react-router-dom'


// MODELO DE PIZARRA O "PLANTILLA"
interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
}

//TIPOS DE PIZARRAS 3 ACIONES POSIBLES SOLAMENTE
type AuthAction =
  | { type: 'INITIALIZE'; payload: { user: AuthUser; token: string } | null }
  | { type: 'LOGIN'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
}

// REDUCE COMO QUEDARÁ LA PIZARRA EN DEPENDIENDO DEL CASO (TYPE) como filtro
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZE':
      return action.payload
        ? { user: action.payload.user, token: action.payload.token, isLoading: false }
        : { user: null, token: null, isLoading: false }

    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      }

    case 'LOGOUT':
      return { user: null, token: null, isLoading: false }

    default:
      return state
  }
}

function decodeToken(token: string): { user: AuthUser; token: string } | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    // Comprobar expiración
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null

    // Normalizar el rol (quitar prefijo "ROLE_" si lo lleva)
    const cleaned = payload.role.toUpperCase().replace(/^ROLE_/, '')
    if (cleaned !== 'ADMIN' && cleaned !== 'MUSICIAN' && cleaned !== 'USER') return null

    return {
      token,
      user: { username: payload.sub, role: cleaned as Role },
    }
  } catch {
    return null
  }
}

interface AuthContextValue {
  state: AuthState
  login: (token: string) => void
  logout: (messaje?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)


//PROVEE LA PIZARRA
export function AuthProvider({ children }: { children: ReactNode }) {
  //COMO useState PERO MÁS COMPLEJO PORQUE HACE ACCION DE LLAMAR A REDUCER PARA QUE CAMBIE
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()


  // Al montar la app, intentamos restaurar la sesión desde localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      dispatch({ type: 'INITIALIZE', payload: null })
      return
    }
    const decoded = decodeToken(token)
    if (decoded) {
      dispatch({ type: 'INITIALIZE', payload: decoded })
    } else {
      // Token caducado o inválido → limpiamos
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      dispatch({ type: 'INITIALIZE', payload: null })
    }
    // aqui le hemos dicho a react que solo ejecute esto una vez para mirar el localStorage
  }, [])

  function login(token: string) {
    const decoded = decodeToken(token)
    if (!decoded) {
      throw new Error('Token recibido inválido')
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    dispatch({ type: 'LOGIN', payload: decoded })
  }

  function logout(message?: string) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    
    if (message) {
      // Codificamos el texto para que sea seguro en la URL
      const searchParams = new URLSearchParams({ info: message })
      navigate(`/login?${searchParams.toString()}`, { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
    dispatch({ type: 'LOGOUT' })
}

  //todo lo que este dentro de esto (childrens) podran usar el auth
  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

//Para consumir el contesxto
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  }
  return ctx
}