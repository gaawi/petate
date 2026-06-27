import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Garments from './pages/Garments'
import Wardrobes from './pages/Wardrobes'
import Suitcases from './pages/Suitcases'
import Trips from './pages/Trips'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ropa" element={<Garments />} />
          <Route path="/armarios" element={<Wardrobes />} />
          <Route path="/maletas" element={<Suitcases />} />
          <Route path="/viajes" element={<Trips />} />
          <Route path="/ajustes" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
