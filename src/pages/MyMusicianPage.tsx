import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { becomeMusician } from '../services/musicianService'
import { useAuth } from '../contexts/AuthContext'
import type { NewMusician } from '../types/musician'
import AppLayout from '../components/AppLayout'

const DNI_REGEX = /^\d{8}[A-Za-z]$/

function MyMusicianPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dni, setDni] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [affiliated, setAffiliated] = useState(false)
  const [performanceFee, setPerformanceFee] = useState('') // string para validar
  const [affiliatedNumber, setAffiliatedNumber] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // VALIDACIONES
    if (lastName.trim().length === 0) {
      setError('El apellido es obligatorio')
      return
    }
    if (!DNI_REGEX.test(dni)) {
      setError('DNI inválido (8 dígitos + letra, ej: 12345678A)')
      return
    }

    let feeNumber: number | null = null
    if (performanceFee.trim() !== '') {
      const n = Number(performanceFee)
      if (Number.isNaN(n) || n <= 0) {
        setError('El caché debe ser un número positivo')
        return
      }
      feeNumber = n
    }

    let affiliatedNumberValue = 0
    if (affiliatedNumber.trim() !== '') {
      const n = Number(affiliatedNumber)
      if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
        setError('El número de afiliación debe ser un entero válido')
        return
      }
      affiliatedNumberValue = n
    }

    setError(null)
    setLoading(true)

    const payload: NewMusician = {
      firstName: firstName.trim() || null,
      lastName: lastName.trim(),
      dni: dni.trim(),
      birthDate: birthDate || null,
      affiliated,
      performanceFee: feeNumber,
      affiliatedNumber: affiliatedNumberValue,
    }

    try {
      await becomeMusician(payload)
      // Forza logout para actualizar el JWT ya que el back lo ha cambiado
      logout()
      navigate('/login', {
        replace: true,
        state: { info: 'Te has registrado como músico. Inicia sesión de nuevo para acceder.' },
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError('Datos inválidos. Revisa los campos.')
        } else if (err.response?.status === 409) {
          setError('Ya tienes una ficha de músico creada.')
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('No tienes permisos para registrarte como músico.')
        } else if (err.response) {
          setError(`Error ${err.response.status}: no se pudo completar el registro`)
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
        <div>
          <h1 className="text-3xl">Hazte músico</h1>
          <p className="text-sm text-muted mt-1">
            Completa tu ficha para registrar y gestionar tus obras.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label htmlFor="firstName" className="label">Nombre</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="label">Apellido *</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="dni" className="label">DNI *</label>
            <input
              id="dni"
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value.toUpperCase())}
              disabled={loading}
              placeholder="12345678A"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="label">Fecha de nacimiento</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={affiliated}
              onChange={(e) => setAffiliated(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 accent-ink"
            />
            Afiliado a SGAE
          </label>

          <div>
            <label htmlFor="affiliatedNumber" className="label">Número de afiliación</label>
            <input
              id="affiliatedNumber"
              type="number"
              min="0"
              step="1"
              value={affiliatedNumber}
              onChange={(e) => setAffiliatedNumber(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="performanceFee" className="label">Caché por actuación (€)</label>
            <input
              id="performanceFee"
              type="number"
              step="0.01"
              min="0"
              value={performanceFee}
              onChange={(e) => setPerformanceFee(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Registrando…' : 'Hazme músico'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

export default MyMusicianPage
