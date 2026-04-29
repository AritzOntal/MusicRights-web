import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="text-slate-600 mb-4">
        formuario de inicio
        </p>
        <Link to="/dashboard" className="text-blue-700 underline">
          Ir al dashboard
        </Link>
      </div>
    </main>
  )
}

export default LoginPage