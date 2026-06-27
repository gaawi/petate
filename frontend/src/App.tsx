import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Garments from './pages/Garments'
import Wardrobes from './pages/Wardrobes'
import Travel from './pages/Travel'
import Settings from './pages/Settings'

function Gate() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Cargando...
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ropa" element={<Garments />} />
        <Route path="/armarios" element={<Wardrobes />} />
        <Route path="/viajes" element={<Travel />} />
        <Route path="/maletas" element={<Navigate to="/viajes?seg=maletas" replace />} />
        <Route path="/ajustes" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </AuthProvider>
  )
}
