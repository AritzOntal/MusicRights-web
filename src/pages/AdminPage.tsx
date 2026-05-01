import { useAuth } from '../contexts/AuthContext'

function AdminPage() {
    const { state } = useAuth()

    return (
        <main className="min-h-screen p-8 bg-slate-50">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow border p-6">
                <h1 className="text-2xl font-bold text-red-700">Zona de administración</h1>
                <p className="text-slate-600 mt-2">
                    Hola, {state.user?.username}.
                </p>
            </div>
        </main>
    )
}

export default AdminPage