import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import ComedianDashboard from '@/pages/comedian/Dashboard'
import ClubDashboard from '@/pages/club/Dashboard'
import Comedians from '@/pages/Comedians'

function ProtectedRoute({ children, allowedType }: { children: React.ReactNode; allowedType?: 'comedian' | 'club' }) {
  const { user, userType, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedType && userType !== allowedType) {
    return <Navigate to={userType === 'comedian' ? '/comedian' : '/club'} replace />
  }

  return <>{children}</>
}

export default function App() {
  const { user, userType, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={userType === 'comedian' ? '/comedian' : '/club'} replace />
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={userType === 'comedian' ? '/comedian' : '/club'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/comedian/*"
          element={
            <ProtectedRoute allowedType="comedian">
              <ComedianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club"
          element={
            <ProtectedRoute allowedType="club">
              <ClubDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comedians"
          element={
            <ProtectedRoute>
              <Comedians />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
