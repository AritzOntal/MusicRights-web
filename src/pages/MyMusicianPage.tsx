import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { becomeMusician } from '../services/musicianService'
import { useAuth } from '../contexts/AuthContext'
import type { NewMusician } from '../types/musician'

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
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-xl mx-auto space-y-4">

        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-700 underline"
        >
          ← Volver al dashboard
        </button>

        <h1 className="text-2xl font-bold">Hazte músico</h1>
        <p className="text-sm text-slate-600">
          Completa tu ficha para registrar y gestionar tus obras.
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow border space-y-4">

          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Apellido *</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">DNI *</span>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value.toUpperCase())}
              disabled={loading}
              placeholder="12345678A"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Fecha de nacimiento</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={affiliated}
              onChange={(e) => setAffiliated(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm font-medium">Afiliado</span>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Número de afiliación</span>
            <input
              type="number"
              min="0"
              step="1"
              value={affiliatedNumber}
              onChange={(e) => setAffiliatedNumber(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Caché por actuación (€)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={performanceFee}
              onChange={(e) => setPerformanceFee(e.target.value)}
              disabled={loading}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-medium py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Hazme músico'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default MyMusicianPage
