import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import WorkDetailPage from './pages/WorkDetailPage'
import WorkCreatePage from './pages/WorkCreatePage'
import MyMusicianPage from './pages/MyMusicianPage'
import MusicianDetailPage from './pages/MusicianDetailPage'
import ConcertsPage from './pages/ConcertsPage'
import ConcertCreatePage from './pages/ConcertCreatePage'
import ConcertDetailPage from './pages/ConcertDetailPage'
import AdminWorksPage from './pages/AdminWorksPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/works/new"
        element={
          <ProtectedRoute allowedRoles={['MUSICIAN']}>
            <WorkCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/concerts"
        element={
          <ProtectedRoute allowedRoles={['MUSICIAN']}>
            <ConcertsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/concerts/new"
        element={
          <ProtectedRoute allowedRoles={['MUSICIAN']}>
            <ConcertCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/concerts/:id"
        element={
          <ProtectedRoute allowedRoles={['MUSICIAN']}>
            <ConcertDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/musicians/me"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <MyMusicianPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/musicians/:id"
        element={
          <ProtectedRoute>
            <MusicianDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/works/:id"
        element={
          <ProtectedRoute>
            <WorkDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/works"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminWorksPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
