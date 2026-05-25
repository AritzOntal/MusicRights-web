import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { createConcert } from '../services/concertService'
import type { NewConcert } from '../services/concertService'
import AppLayout from '../components/AppLayout'

function ConcertCreatePage() {
  const navigate = useNavigate()

  const [showTitle, setShowTitle] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [date, setDate] = useState('')          
  const [status, setStatus] = useState('')       
  const [performed, setPerformed] = useState(false)
  const [ticketPrice, setTicketPrice] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // VALIDACIONES
    if (showTitle.trim().length === 0) {
      setError('El título del concierto es obligatorio')
      return
    }
    if (city.trim().length === 0) {
      setError('La ciudad es obligatoria')
      return
    }
    if (province.trim().length === 0) {
      setError('La provincia es obligatoria')
      return
    }
    if (date.trim().length === 0) {
      setError('La fecha es obligatoria')
      return
    }

    let priceNumber = 0
    if (ticketPrice.trim() !== '') {
      const n = Number(ticketPrice)
      if (Number.isNaN(n) || n < 0) {
        setError('El precio de la entrada debe ser un número no negativo')
        return
      }
      priceNumber = n
    }

    setError(null)
    setLoading(true)

    const payload: NewConcert = {
      showTitle: showTitle.trim(),
      city: city.trim(),
      province: province.trim(),
      date,
      status: status || null,
      performed,
      ticketPrice: priceNumber,
    }

    try {
      await createConcert(payload)
      // Aún no hay página de detalle de concierto: volvemos al listado
      navigate('/concerts', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError('Datos inválidos. Revisa los campos.')
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('No tienes permisos para crear conciertos')
        } else if (err.response) {
          setError(`Error ${err.response.status}: no se pudo crear el concierto`)
        } else {
          setError('No se pudo conectar con el servidor')
        }
      } else {
        setError('Error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout maxWidth="max-w-xl">
      <div className="space-y-6">
        <h1 className="text-3xl">Nuevo concierto</h1>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label htmlFor="showTitle" className="label">Título del concierto</label>
            <input
              id="showTitle"
              type="text"
              value={showTitle}
              onChange={(e) => setShowTitle(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="city" className="label">Ciudad</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="province" className="label">Provincia</label>
            <input
              id="province"
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="date" className="label">Fecha</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="status" className="label">Estado</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="input"
            >
              <option value="">Sin especificar</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="PENDING">Pendiente</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <label htmlFor="ticketPrice" className="label">Precio de la entrada (€)</label>
            <input
              id="ticketPrice"
              type="number"
              step="0.01"
              min="0"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={performed}
              onChange={(e) => setPerformed(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 accent-ink"
            />
            Ya realizado
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creando…' : 'Crear concierto'}
            </button>
            <button type="button" onClick={() => navigate('/concerts')} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

export default ConcertCreatePage
