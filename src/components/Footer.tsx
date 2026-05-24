function preventNav(e: React.MouseEvent) {
  // Enlaces informativos (sin páginas aún): evitamos que salten al inicio
  e.preventDefault()
}

interface FooterProps {
  variant?: 'full' | 'compact'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  const year = new Date().getFullYear()

  // Versión slim para pantallas de login/registro
  if (variant === 'compact') {
    return (
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-6 py-4 text-xs text-subtle">
          <span>© {year} MusicRights</span>
          <span aria-hidden="true">·</span>
          <a href="#" onClick={preventNav} className="hover:text-ink">Términos</a>
          <span aria-hidden="true">·</span>
          <a href="#" onClick={preventNav} className="hover:text-ink">Privacidad</a>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} MusicRights · Gestión de derechos de autor para músicos</span>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href="#" onClick={preventNav} className="hover:text-ink">Términos</a>
          <a href="#" onClick={preventNav} className="hover:text-ink">Privacidad</a>
          <a href="#" onClick={preventNav} className="hover:text-ink">Cookies</a>
          <a href="#" onClick={preventNav} className="hover:text-ink">Contacto</a>
        </nav>
      </div>
    </footer>
  )
}
