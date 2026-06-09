import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pacientesApi } from '../services/api'
import './ListaPacientes.css'

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    cargar()
  }, [busqueda])

  async function cargar() {
    setCargando(true)
    try {
      const params = busqueda ? { search: busqueda } : {}
      const res = await pacientesApi.listar(params)
      setPacientes(res.data.results || res.data)
      setError(null)
    } catch (e) {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <div className="lista-encabezado">
        <div>
          <h1>Pacientes</h1>
          <p className="subtitulo">{pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} registrado{pacientes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/pacientes/nuevo" className="btn btn-primario">+ Nuevo paciente</Link>
      </div>

      <div className="barra-busqueda tarjeta">
        <input
          type="search"
          placeholder="Buscar por nombre, apellido, CURP o teléfono…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {error && <div className="error-msg">{error}</div>}
      {cargando ? (
        <div className="cargando">Cargando pacientes…</div>
      ) : pacientes.length === 0 ? (
        <div className="vacio tarjeta">
          <p>No se encontraron pacientes.</p>
          <Link to="/pacientes/nuevo">Registrar el primero →</Link>
        </div>
      ) : (
        <>
          {/* Mobile cards (visible ≤ 640px) */}
          <div className="lista-cards">
            {pacientes.map(p => (
              <Link key={p.id} to={`/pacientes/${p.id}`} className="paciente-card tarjeta">
                <div className="paciente-card-info">
                  <div className="paciente-card-nombre">{p.nombre_completo}</div>
                  <div className="paciente-card-meta">{p.edad} años · {p.ciudad}</div>
                </div>
                <div className="paciente-card-derecha">
                  <span className={`badge ${p.activo ? 'badge-verde' : 'badge-gris'}`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table (visible > 640px) */}
          <div className="tabla-contenedor tarjeta">
            <table className="tabla-pacientes">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/pacientes/${p.id}`} className="nombre-link">
                        {p.nombre_completo}
                      </Link>
                    </td>
                    <td>{p.edad} años</td>
                    <td>{p.sexo_display}</td>
                    <td>{p.telefono}</td>
                    <td>{p.ciudad}</td>
                    <td>
                      <span className={`badge ${p.activo ? 'badge-verde' : 'badge-gris'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/pacientes/${p.id}`} className="btn btn-secundario btn-sm">Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
