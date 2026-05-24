import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Footer from './Footer'

interface NavItem {
  label: string
  to: string
}

interface AppLayoutProps {
  children: ReactNode
  maxWidth?: string // clase max-w de Tailwind
}

function initials(name?: string) {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}

export default function AppLayout({ children, maxWidth = 'max-w-5xl' }: AppLayoutProps) {
  const { state, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const role = state.user?.role

  let items: NavItem[]
  if (role === 'ADMIN') {
    items = [
      { label: 'Usuarios', to: '/admin' },
      { label: 'Obras', to: '/admin/works' },
    ]
  } else {
    items = [{ label: 'Obras', to: '/dashboard' }]
    if (role === 'MUSICIAN') items.push({ label: 'Conciertos', to: '/concerts' })
    if (role === 'MUSICIAN') items.push({ label: 'Documentos', to: '/documents' })
    if (role === 'USER') items.push({ label: 'Hazte músico', to: '/musicians/me' })
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className={`mx-auto flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-2 sm:flex-nowrap sm:py-0 ${maxWidth}`}>
          <Link to="/dashboard" className="font-serif text-xl font-semibold tracking-tight text-accent">
            MusicRights
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {items.map((it) => {
              // /admin es prefijo de /admin/works, así que para esa pestaña exigimos match exacto
              const active =
                it.to === '/admin'
                  ? pathname === '/admin'
                  : pathname === it.to || pathname.startsWith(it.to + '/')
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active ? 'font-medium text-accent' : 'text-muted hover:text-ink'
                  }`}
                >
                  {it.label}
                </Link>
              )
            })}

            <span className="mx-2 h-5 w-px bg-line" />

            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-white"
              title={state.user?.username}
            >
              {initials(state.user?.username)}
            </span>
            <button onClick={handleLogout} className="btn-ghost btn-sm ml-2" title="Cerrar sesión">
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-6 py-10 ${maxWidth}`}>{children}</main>

      <Footer />
    </div>
  )
}
