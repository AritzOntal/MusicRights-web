import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-slate-600 mb-4">
          Contenido segun el rol
        </p>
        <Link to="/login" className="text-blue-700 underline">
          Volver al login
        </Link>
      </div>
    </main>
  )
}

export default DashboardPage