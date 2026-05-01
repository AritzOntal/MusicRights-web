export type Role = 'ADMIN' | 'MUSICIAN' | 'USER'

export interface AuthUser {
  username: string
  role: Role
}

// Lo que devuelve tu backend al decodificarlo
export interface JwtPayload {
  sub: string         // username
  role: string        // tipo rol
  exp: number         // expriacion
}