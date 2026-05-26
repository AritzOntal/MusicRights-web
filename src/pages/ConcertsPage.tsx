import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useConcerts } from '../hooks/useConcerts'
import { deleteConcert } from '../services/concertService'

// Función auxiliar para calcular los plazos de caducidad (5 años desde el concierto)
function getCaducidadInfo(dateString: string) {
  const fechaConcierto = new Date(dateString)
  if (isNaN(fechaConcierto.getTime())) {
    return { texto: 'Fecha inválida', clases: 'bg-paper text-subtle border border-line' }
  }

  const fechaCaducidad = new Date(fechaConcierto)
  fechaCaducidad.setFullYear(fechaCaducidad.getFullYear() + 5)

  const hoy = new Date()
  const diferenciaTiempo = fechaCaducidad.getTime() - hoy.getTime()

  const milisegundosEnDia = 1000 * 60 * 60 * 24
  const diasRestantes = diferenciaTiempo / milisegundosEnDia
  const aniosRestantes = diasRestantes / 365.25

  // 1. Ya ha caducado -> rojo de marca suave (acción ya perdida)
  if (diasRestantes <= 0) {
    return {
      texto: 'Caducado',
      clases: 'bg-accent-soft text-accent border border-accent/30 font-semibold',
    }
  }

  // 2. Menos de una semana (7 días) -> urgencia máxima: rojo de marca sólido
  if (diasRestantes <= 7) {
    const dias = Math.ceil(diasRestantes)
    return {
      texto: `Caduca en ${dias} ${dias === 1 ? 'día' : 'días'}`,
      clases: 'bg-accent text-white border border-accent font-semibold',
    }
  }

  // 3. Menos de 1 año -> advertencia: ámbar sobrio
  if (aniosRestantes < 1) {
    return {
      texto: `Caduca en ${aniosRestantes.toFixed(1).replace('.', ',')} años`,
      clases: 'bg-warn-soft text-warn border border-warn/20 font-medium',
    }
  }

  // 4. Más de 1 año -> margen de sobra: neutro sobrio
  return {
    texto: `${aniosRestantes.toFixed(1).replace('.', ',')} años restantes`,
    clases: 'bg-paper text-muted border border-line',
  }
}

function ConcertsPage() {
  const navigate = useNavigate()
  const { concerts, loading, error, removeConcert } = useConcerts()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: number) {
    const ok = window.confirm(
      '¿Seguro que quieres eliminar este concierto? Se borrarán también sus documentos generados y no se puede deshacer.',
    )
    if (!ok) return
    setDeleteError(null)
    setDeletingId(id)
    try {
      await deleteConcert(id)
      removeConcert(id)
    } catch {
      setDeleteError('No se pudo eliminar el concierto')
    } finally {
      setDeletingId(null)
    }
  }

  const total = concerts.length

  // Contador dinámico para la métrica superior (Conciertos en estado Crítico o Próximo)
  const proximosACaducar = concerts.filter(c => {
    const fechaConcierto = new Date(c.date)
    if (isNaN(fechaConcierto.getTime())) return false
    
    const fechaCaducidad = new Date(fechaConcierto)
    fechaCaducidad.setFullYear(fechaCaducidad.getFullYear() + 5)
    
    const dias = (fechaCaducidad.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    return dias > 0 && dias <= 365.25 // Cuenta si le queda menos de un año pero no ha caducado
  }).length

  const metrics: Array<[string, string]> = [
    ['Conciertos registrados', String(total)],
    ['Próximos a caducar', String(proximosACaducar)],
    ['PDFs generados', '0'],
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-3xl">Mis conciertos</h1>
            <p className="text-sm text-muted mt-1">
              Registra tus conciertos y genera el documento oficial de SGAE en un clic.
            </p>
          </div>
          <button onClick={() => navigate('/concerts/new')} className="btn-primary">
            + Nuevo concierto
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-paper border border-line p-4">
              <div className="text-xs text-muted">{label}</div>
              <div className="font-serif text-2xl font-semibold mt-1">{value}</div>
            </div>
          ))}
        </div>

        {loading && <p className="text-muted">Cargando conciertos…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

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
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="p-3 text-left font-medium">Título</th>
                  <th className="p-3 text-left font-medium">Ciudad</th>
                  <th className="p-3 text-left font-medium">Provincia</th>
                  <th className="p-3 text-left font-medium">Fecha</th>
                  <th className="p-3 text-left font-medium">Plazo de reclamación</th>
                  <th className="p-3 text-left font-medium">Realizado</th>
                  <th className="p-3 text-left font-medium">Precio</th>
                  <th className="p-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {concerts.map((c) => {
                  const infoCaducidad = getCaducidadInfo(c.date)
                  return (
                    <tr key={c.id} className="border-t border-line">
                      <td className="p-3 font-medium">{c.showTitle}</td>
                      <td className="p-3 text-muted">{c.city}</td>
                      <td className="p-3 text-muted">{c.province}</td>
                      <td className="p-3 text-muted">{c.date}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-block ${infoCaducidad.clases}`}>
                          {infoCaducidad.texto}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={c.performed ? 'badge-neutral' : 'badge-warn'}>
                          {c.performed ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="p-3 text-muted">{c.ticketPrice} €</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/concerts/${c.id}`)}
                            className="btn-ghost btn-sm"
                            disabled={infoCaducidad.texto === 'Caducado'}
                          >
                            Reclamar
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="btn-ghost btn-sm text-red-600"
                          >
                            {deletingId === c.id ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default ConcertsPage