import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
import ListaPacientes from './pages/ListaPacientes'
import DetallePaciente from './pages/DetallePaciente'
import FormPaciente from './pages/FormPaciente'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'
import './App.css'

function RutaProtegida({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Close menu on navigation
  useEffect(() => { setMenuAbierto(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <header className="barra-nav">
        <div className="nav-marca">
          <img src="/src/static/aurum_logo.png" alt="AURUM" height="36" style={{ display: 'block' }} />
          <div className="nav-marca-texto">
            <span className="nav-marca-aurum">AURUM</span>
            <span className="nav-marca-subtitulo">Centro Cardiopulmonar</span>
          </div>
        </div>

        <button
          className="hamburguesa"
          onClick={() => setMenuAbierto(m => !m)}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links${menuAbierto ? ' nav-abierto' : ''}`}>
          <div className="nav-divisor" />
          <NavLink to="/" end>Pacientes</NavLink>
          <NavLink to="/pacientes/nuevo">+ Nuevo</NavLink>
          <button className="btn-secundario" onClick={handleLogout}>Cerrar sesión</button>
        </nav>
      </header>
      <main className="contenido-principal">
        <Routes>
          <Route path="/" element={<ListaPacientes />} />
          <Route path="/pacientes/nuevo" element={<FormPaciente />} />
          <Route path="/pacientes/:id" element={<DetallePaciente />} />
          <Route path="/pacientes/:id/editar" element={<FormPaciente />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<RutaProtegida><Layout /></RutaProtegida>} />
    </Routes>
  )
}
