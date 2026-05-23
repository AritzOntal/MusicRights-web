import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getConcertById, updateConcert } from '../services/concertService'
import type { UpdateConcert } from '../services/concertService'
import { useWorks } from '../hooks/useWorks'
import AppLayout from '../components/AppLayout'

interface FormState {
  showTitle: string
  city: string
  province: string
  date: string
  status: string
  performed: boolean
  ticketPrice: string
  time: string
  venueName: string
  venueAddress: string
  venueOwner: string
  capacity: string
  performers: string
  ticketClass: string
  totalTickets: string
  tariffType: string
}

const EMPTY_FORM: FormState = {
  showTitle: '', city: '', province: '', date: '', status: '', performed: false,
  ticketPrice: '', time: '', venueName: '', venueAddress: '', venueOwner: '',
  capacity: '', performers: '', ticketClass: '', totalTickets: '', tariffType: '',
}

function numToStr(n: number | null | undefined): string {
  return n == null ? '' : String(n)
}

function ConcertDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const concertId = Number(id)
  const validId = id !== undefined && !Number.isNaN(concertId)

  const { works, loading: worksLoading } = useWorks()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [selectedWorkIds, setSelectedWorkIds] = useState<number[]>([])
  // longitude/latitude no se editan aquí pero se conservan al guardar
  const [coords, setCoords] = useState<{ longitude: number | null; latitude: number | null }>({
    longitude: null,
    latitude: null,
  })

  const [loading, setLoading] = useState(validId)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  useEffect(() => {
    if (!validId) return
    getConcertById(concertId)
      .then((c) => {
        setForm({
          showTitle: c.showTitle ?? '',
          city: c.city ?? '',
          province: c.province ?? '',
          date: c.date ?? '',
          status: c.status ?? '',
          performed: c.performed ?? false,
          ticketPrice: numToStr(c.ticketPrice),
          time: c.time ? c.time.slice(0, 5) : '',
          venueName: c.venueName ?? '',
          venueAddress: c.venueAddress ?? '',
          venueOwner: c.venueOwner ?? '',
          capacity: numToStr(c.capacity),
          performers: c.performers ?? '',
          ticketClass: c.ticketClass ?? '',
          totalTickets: numToStr(c.totalTickets),
          tariffType: c.tariffType ?? '',
        })
        setSelectedWorkIds((c.works ?? []).map((w) => w.id))
        setCoords({ longitude: c.longitude ?? null, latitude: c.latitude ?? null })
        setLoadError(null)
      })
      .catch(() => setLoadError('No se pudo cargar el concierto'))
      .finally(() => setLoading(false))
  }, [concertId, validId])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaveOk(false)
  }

  function toggleWork(wid: number) {
    setSaveOk(false)
    setSelectedWorkIds((prev) =>
      prev.includes(wid) ? prev.filter((x) => x !== wid) : [...prev, wid],
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (form.showTitle.trim().length === 0) { setSaveError('El título es obligatorio'); return }
    if (form.city.trim().length === 0) { setSaveError('La ciudad es obligatoria'); return }
    if (form.province.trim().length === 0) { setSaveError('La provincia es obligatoria'); return }
    if (form.date.trim().length === 0) { setSaveError('La fecha es obligatoria'); return }

    // Validación de numéricos opcionales
    const numeric: Array<[string, string, boolean]> = [
      ['precio de la entrada', form.ticketPrice, false],
      ['aforo', form.capacity, true],
      ['nº de localidades', form.totalTickets, true],
    ]
    for (const [label, raw, integer] of numeric) {
      if (raw.trim() !== '') {
        const n = Number(raw)
        if (Number.isNaN(n) || n < 0 || (integer && !Number.isInteger(n))) {
          setSaveError(`El campo ${label} debe ser un número${integer ? ' entero' : ''} no negativo`)
          return
        }
      }
    }

    setSaveError(null)
    setSaving(true)

    const payload: UpdateConcert = {
      showTitle: form.showTitle.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      date: form.date,
      status: form.status || null,
      performed: form.performed,
      ticketPrice: form.ticketPrice.trim() === '' ? 0 : Number(form.ticketPrice),
      longitude: coords.longitude,
      latitude: coords.latitude,
      time: form.time || null,
      venueName: form.venueName.trim() || null,
      venueAddress: form.venueAddress.trim() || null,
      capacity: form.capacity.trim() === '' ? null : Number(form.capacity),
      venueOwner: form.venueOwner.trim() || null,
      performers: form.performers.trim() || null,
      ticketClass: form.ticketClass.trim() || null,
      totalTickets: form.totalTickets.trim() === '' ? null : Number(form.totalTickets),
      tariffType: form.tariffType || null,
      works: selectedWorkIds.map((wid) => ({ id: wid })),
    }

    try {
      await updateConcert(concertId, payload)
      setSaveOk(true)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setSaveError('Datos inválidos. Revisa los campos.')
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setSaveError('No tienes permisos para editar este concierto')
        } else if (err.response?.status === 404) {
          setSaveError('El concierto ya no existe')
        } else if (err.response) {
          setSaveError(`Error ${err.response.status}: no se pudo guardar`)
        } else {
          setSaveError('No se pudo conectar con el servidor')
        }
      } else {
        setSaveError('Error inesperado')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!validId) {
    return (
      <AppLayout maxWidth="max-w-2xl">
        <div className="space-y-4">
          <p className="text-red-600">Identificador de concierto inválido</p>
          <button onClick={() => navigate('/concerts')} className="btn-ghost">
            ← Volver a conciertos
          </button>
        </div>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout maxWidth="max-w-2xl">
        <p className="text-muted">Cargando concierto…</p>
      </AppLayout>
    )
  }

  if (loadError) {
    return (
      <AppLayout maxWidth="max-w-2xl">
        <div className="space-y-4">
          <p className="text-red-600">{loadError}</p>
          <button onClick={() => navigate('/concerts')} className="btn-ghost">
            ← Volver a conciertos
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">{form.showTitle || 'Concierto'}</h1>
            <p className="text-sm text-muted mt-1">
              Completa los datos del formulario de SGAE y guárdalos.
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Disponible en el siguiente paso"
            className="btn-ghost"
          >
            Generar PDF SGAE
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* ---- Datos básicos ---- */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg">Datos básicos</h2>

            <div>
              <label htmlFor="showTitle" className="label">Título del concierto</label>
              <input id="showTitle" type="text" className="input" disabled={saving}
                value={form.showTitle} onChange={(e) => setField('showTitle', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="label">Ciudad</label>
                <input id="city" type="text" className="input" disabled={saving}
                  value={form.city} onChange={(e) => setField('city', e.target.value)} />
              </div>
              <div>
                <label htmlFor="province" className="label">Provincia</label>
                <input id="province" type="text" className="input" disabled={saving}
                  value={form.province} onChange={(e) => setField('province', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="label">Fecha</label>
                <input id="date" type="date" className="input" disabled={saving}
                  value={form.date} onChange={(e) => setField('date', e.target.value)} />
              </div>
              <div>
                <label htmlFor="time" className="label">Hora prevista</label>
                <input id="time" type="time" className="input" disabled={saving}
                  value={form.time} onChange={(e) => setField('time', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="label">Estado</label>
                <select id="status" className="input" disabled={saving}
                  value={form.status} onChange={(e) => setField('status', e.target.value)}>
                  <option value="">Sin especificar</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink mt-7">
                <input type="checkbox" className="h-4 w-4 accent-ink" disabled={saving}
                  checked={form.performed} onChange={(e) => setField('performed', e.target.checked)} />
                Ya realizado
              </label>
            </div>
          </div>

          {/* ---- Datos del local ---- */}
          <div className="space-y-4 border-t border-line pt-5">
            <h2 className="font-serif text-lg">Datos del local</h2>

            <div>
              <label htmlFor="venueName" className="label">Nombre del local</label>
              <input id="venueName" type="text" className="input" disabled={saving}
                value={form.venueName} onChange={(e) => setField('venueName', e.target.value)} />
            </div>

            <div>
              <label htmlFor="venueAddress" className="label">Domicilio del local</label>
              <input id="venueAddress" type="text" className="input" disabled={saving}
                value={form.venueAddress} onChange={(e) => setField('venueAddress', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="venueOwner" className="label">Titular del local</label>
                <input id="venueOwner" type="text" className="input" disabled={saving}
                  value={form.venueOwner} onChange={(e) => setField('venueOwner', e.target.value)} />
              </div>
              <div>
                <label htmlFor="capacity" className="label">Aforo total</label>
                <input id="capacity" type="number" min="0" step="1" className="input" disabled={saving}
                  value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} />
              </div>
            </div>

            <div>
              <label htmlFor="performers" className="label">Actuantes</label>
              <input id="performers" type="text" className="input" disabled={saving}
                value={form.performers} onChange={(e) => setField('performers', e.target.value)} />
            </div>
          </div>

          {/* ---- Entradas ---- */}
          <div className="space-y-4 border-t border-line pt-5">
            <h2 className="font-serif text-lg">Entradas</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="ticketClass" className="label">Clase de localidad</label>
                <input id="ticketClass" type="text" className="input" disabled={saving}
                  value={form.ticketClass} onChange={(e) => setField('ticketClass', e.target.value)} />
              </div>
              <div>
                <label htmlFor="totalTickets" className="label">Nº de localidades</label>
                <input id="totalTickets" type="number" min="0" step="1" className="input" disabled={saving}
                  value={form.totalTickets} onChange={(e) => setField('totalTickets', e.target.value)} />
              </div>
              <div>
                <label htmlFor="ticketPrice" className="label">Precio (€)</label>
                <input id="ticketPrice" type="number" min="0" step="0.01" className="input" disabled={saving}
                  value={form.ticketPrice} onChange={(e) => setField('ticketPrice', e.target.value)} />
              </div>
            </div>

            <div>
              <label htmlFor="tariffType" className="label">Tarifa aplicable</label>
              <select id="tariffType" className="input" disabled={saving}
                value={form.tariffType} onChange={(e) => setField('tariffType', e.target.value)}>
                <option value="">Sin especificar</option>
                <option value="PERCENTAGE">Porcentual (8,5%)</option>
                <option value="FLAT">Tanto alzado</option>
              </select>
            </div>
          </div>

          {/* ---- Setlist ---- */}
          <div className="space-y-3 border-t border-line pt-5">
            <h2 className="font-serif text-lg">Setlist (obras ejecutadas)</h2>
            {worksLoading && <p className="text-sm text-muted">Cargando tu catálogo…</p>}
            {!worksLoading && works.length === 0 && (
              <p className="text-sm text-muted">No tienes obras en tu catálogo todavía.</p>
            )}
            {!worksLoading && works.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {works.map((w) => (
                  <label key={w.id} className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" className="h-4 w-4 accent-ink" disabled={saving}
                      checked={selectedWorkIds.includes(w.id)} onChange={() => toggleWork(w.id)} />
                    {w.title}
                  </label>
                ))}
              </div>
            )}
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {saveOk && <p className="text-sm text-green-700">Cambios guardados.</p>}

          <div className="flex gap-3 border-t border-line pt-5">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => navigate('/concerts')} className="btn-ghost">
              Volver
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

export default ConcertDetailPage
