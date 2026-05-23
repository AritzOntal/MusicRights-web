import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useConcerts } from '../hooks/useConcerts'

function ConcertsPage() {
  const navigate = useNavigate()
  const { concerts, loading, error } = useConcerts()

  const total = concerts.length

  const metrics: Array<[string, string]> = [
    ['Conciertos registrados', String(total)],
    ['Próximos a caducar', '0'],
    ['PDFs generados', '0'],
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">Conciertos</h1>
            <p className="text-sm text-muted mt-1">
              Registra tus conciertos y genera el documento oficial de SGAE en un clic.
            </p>
          </div>
          <button onClick={() => navigate('/concerts/new')} className="btn-primary">
            + Nuevo concierto
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-paper border border-line p-4">
              <div className="text-xs text-muted">{label}</div>
              <div className="font-serif text-2xl font-semibold mt-1">{value}</div>
            </div>
          ))}
        </div>

        {loading && <p className="text-muted">Cargando conciertos…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && total === 0 && (
          <div className="card p-12 text-center">
            <p className="font-serif text-lg">Aún no hay conciertos</p>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Crea tu primer concierto con el botón «+ Nuevo concierto» para empezar a
              gestionar tus derechos de SGAE.
            </p>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="p-3 text-left font-medium">Título</th>
                  <th className="p-3 text-left font-medium">Ciudad</th>
                  <th className="p-3 text-left font-medium">Provincia</th>
                  <th className="p-3 text-left font-medium">Fecha</th>
                  <th className="p-3 text-left font-medium">Estado</th>
                  <th className="p-3 text-left font-medium">Realizado</th>
                  <th className="p-3 text-left font-medium">Precio</th>
                  <th className="p-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {concerts.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="p-3 font-medium">{c.showTitle}</td>
                    <td className="p-3 text-muted">{c.city}</td>
                    <td className="p-3 text-muted">{c.province}</td>
                    <td className="p-3 text-muted">{c.date}</td>
                    <td className="p-3 text-muted">{c.status ?? '—'}</td>
                    <td className="p-3">
                      <span className={c.performed ? 'badge-neutral' : 'badge-warn'}>
                        {c.performed ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="p-3 text-muted">{c.ticketPrice} €</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/concerts/${c.id}`)}
                        className="btn-ghost btn-sm"
                      >
                        Reclamar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default ConcertsPage
