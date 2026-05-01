import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function DashboardPage() {
  const { state, logout } = useAuth()

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow border p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-600 text-sm">
              {/* Utilizamos el state para sacar el nombre con ? para evitar null */}
              Hola <span className="font-medium">{state.user?.username}</span> —
              rol: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{state.user?.role}</span>
            </p>
          </div>
          <button
            /* Cuando cambia estado, es reactivo (no hay porque redirgir a Login)  */
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="text-slate-700">
          {/* Aquí irán las tablas y resúmenes según el rol (eso lo hacemos en el Punto 4) */}
        </p>

        {state.user?.role === 'ADMIN' && (
          <Link to="/admin" className="text-blue-700 underline">
            Panel admin
          </Link>
        )}

      </div>
    </main>
  )
}

export default DashboardPage