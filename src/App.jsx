import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Avisos from './pages/Avisos'
import Documentos from './pages/Documentos'
import AreaMilitar from './pages/AreaMilitar'
import Eventos from './pages/Eventos'
import Calendario from './pages/Calendario'
import Galeria from './pages/Galeria'
import Clubes from './pages/Clubes'
import ClubeDetalhe from './pages/ClubeDetalhe'
import MeuQRCode from './pages/MeuQRCode'
import Scanner from './pages/Scanner'
import Olimpiadas from './pages/Olimpiadas'
import OlimpiadaDetalhe from './pages/OlimpiadaDetalhe'
import Sobre from './pages/Sobre'

function RotaProtegida({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      Carregando...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}

function RotaMilitar({ children }) {
  const { perfil, loading } = useAuth()

  if (loading) return null

  if (!perfil || !['admin', 'militar'].includes(perfil.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function Rotas() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <RotaProtegida>
          <AppLayout />
        </RotaProtegida>
      }>
        <Route index element={<Dashboard />} />
        <Route path="avisos" element={<Avisos />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="clubes" element={<Clubes />} />
        <Route path="clubes/:clubeId" element={<ClubeDetalhe />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="sobre" element={<Sobre />} />
        <Route path="olimpiadas" element={<Olimpiadas />} />
        <Route path="olimpiadas/:olimpiadaId" element={<OlimpiadaDetalhe />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="qrcode" element={<MeuQRCode />} />
        <Route path="militar" element={
          <RotaMilitar>
            <AreaMilitar />
          </RotaMilitar>
        } />
        <Route path="scanner" element={
          <RotaMilitar>
            <Scanner />
          </RotaMilitar>
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </AuthProvider>
  )
}