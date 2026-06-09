import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await api.post('/token/', form)
      login(res.data.access, res.data.refresh)
      navigate('/')
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-fondo">
      <div className="login-tarjeta tarjeta">
        <div className="login-logo">
          <img src="/src/static/aurum_logo.png" alt="AURUM" height="48" style={{ display: 'block' }} />
          <div>
            <div className="login-nombre">AURUM</div>
          </div>
        </div>
        <p className="login-subtitulo-marca">Centro Cardiopulmonar y de Medicina Interna</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="campo-grupo">
            <label>Usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              autoFocus
              required
            />
          </div>
          <div className="campo-grupo">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primario login-btn" disabled={cargando}>
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
