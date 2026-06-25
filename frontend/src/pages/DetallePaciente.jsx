import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { pacientesApi, recetasApi } from '../services/api'
import TablaSegurosMedicos from '../components/TablaSegurosMedicos'
import TablaHospitalizaciones from '../components/TablaHospitalizaciones'
import TabHistoriaClinica from '../components/TabHistoriaClinica'
import './DetallePaciente.css'

export default function DetallePaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [tabActiva, setTabActiva] = useState('info')

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    setCargando(true)
    try {
      const res = await pacientesApi.obtener(id)
      setPaciente(res.data)
      setError(null)
    } catch {
      setError('No se pudo cargar el expediente del paciente.')
    } finally {
      setCargando(false)
    }
  }

  async function eliminar() {
    if (!confirm('¿Eliminar este paciente? Esta acción no se puede deshacer.')) return
    try {
      await pacientesApi.eliminar(id)
      navigate('/')
    } catch {
      alert('No se pudo eliminar el paciente.')
    }
  }

  if (cargando) return <div className="cargando">Cargando expediente…</div>
  if (error) return <div className="error-msg">{error}</div>
  if (!paciente) return null

  const edad = (() => {
    const hoy = new Date()
    const nac = new Date(paciente.fecha_nacimiento)
    let e = hoy.getFullYear() - nac.getFullYear()
    if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--
    return e
  })()

  return (
    <div className="detalle-paciente">
      <div className="detalle-nav">
        <Link to="/" className="volver">← Pacientes</Link>
      </div>

      <div className="detalle-cabecera tarjeta">
        <div className="cabecera-avatar">
          <div className="avatar">{paciente.nombre[0]}{paciente.apellido_paterno[0]}</div>
          <div>
            <h1>{paciente.nombre_completo}</h1>
            <div className="cabecera-meta">
              <span>{edad} años</span>
              <span>·</span>
              <span>{paciente.sexo_display}</span>
              {paciente.tipo_sangre && <><span>·</span><span className="badge badge-rojo">Tipo {paciente.tipo_sangre}</span></>}
              <span className={`badge ${paciente.activo ? 'badge-verde' : 'badge-gris'}`}>
                {paciente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
        <div className="cabecera-acciones">
          <Link to={`/pacientes/${id}/editar`} className="btn btn-secundario">Editar</Link>
          <button className="btn btn-peligro" onClick={eliminar}>Eliminar</button>
        </div>
      </div>

      <div className="tabs-barra">
        {[
          ['info', 'Información personal'],
          ['historia', 'Historia Clínica'],
          ['seguro', 'Seguro médico'],
          ['hospitalizacion', 'Hospitalizaciones'],
          ['receta', 'Recetas'],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`tab-btn ${tabActiva === k ? 'activa' : ''}`}
            onClick={() => setTabActiva(k)}
          >{label}{k === 'seguro' ? ` (${paciente.seguros?.length || 0})` : k === 'hospitalizacion' ? ` (${paciente.hospitalizaciones?.length || 0})` : ''}</button>
        ))}
      </div>

      {tabActiva === 'info' && (
        <div className="seccion-info">
          <InfoSection titulo="Datos personales">
            <Campo label="Nombre completo" valor={paciente.nombre_completo} />
            <Campo label="Fecha de nacimiento" valor={`${new Date(paciente.fecha_nacimiento).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} (${edad} años)`} />
            <Campo label="Sexo" valor={paciente.sexo_display} />
            <Campo label="Estado civil" valor={paciente.estado_civil_display} />
            <Campo label="CURP" valor={paciente.curp} />
            <Campo label="RFC" valor={paciente.rfc} />
          </InfoSection>

          <InfoSection titulo="Contacto">
            <Campo label="Teléfono" valor={paciente.telefono} />
            <Campo label="Correo electrónico" valor={paciente.email} />
            <Campo label="Contacto de emergencia" valor={paciente.contacto_emergencia} />
            <Campo label="Teléfono de emergencia" valor={paciente.telefono_emergencia} />
          </InfoSection>

          <InfoSection titulo="Dirección">
            <Campo label="Calle y número" valor={paciente.calle} span={2} />
            <Campo label="Colonia" valor={paciente.colonia} />
            <Campo label="Ciudad" valor={paciente.ciudad} />
            <Campo label="Estado" valor={paciente.estado} />
            <Campo label="Código postal" valor={paciente.codigo_postal} />
          </InfoSection>

          <InfoSection titulo="Información médica">
            <Campo label="Tipo de sangre" valor={paciente.tipo_sangre} />
            <Campo label="Alergias" valor={paciente.alergias} span={2} />
            <Campo label="Enfermedades crónicas" valor={paciente.enfermedades_cronicas} span={2} />
            <Campo label="Medicamentos actuales" valor={paciente.medicamentos_actuales} span={2} />
            <Campo label="Notas adicionales" valor={paciente.notas} span={2} />
          </InfoSection>
        </div>
      )}

      {tabActiva === 'historia' && (
        <TabHistoriaClinica pacienteId={id} />
      )}

      {tabActiva === 'seguro' && (
        <TablaSegurosMedicos pacienteId={id} seguros={paciente.seguros || []} onActualizar={cargar} />
      )}

      {tabActiva === 'hospitalizacion' && (
        <TablaHospitalizaciones pacienteId={id} hospitalizaciones={paciente.hospitalizaciones || []} onActualizar={cargar} />
      )}

      {tabActiva === 'receta' && (
        <TabRecetas pacienteId={id} paciente={paciente} edad={edad} />
      )}
    </div>
  )
}

function InfoSection({ titulo, children }) {
  return (
    <div className="info-section tarjeta">
      <h3 className="info-titulo">{titulo}</h3>
      <div className="info-grid">{children}</div>
    </div>
  )
}

function Campo({ label, valor, span }) {
  return (
    <div className="campo-display" style={span ? { gridColumn: `span ${span}` } : {}}>
      <dt>{label}</dt>
      <dd>{valor || <span className="sin-dato">—</span>}</dd>
    </div>
  )
}

function TabRecetas({ pacienteId, paciente, edad }) {
  const hoy = new Date().toISOString().slice(0, 10)
  const [recetas, setRecetas] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [form, setForm] = useState({ fecha: hoy, peso: '', talla: '', diagnostico: '', indicaciones: '' })
  const [guardando, setGuardando] = useState(false)
  const [pdfCargando, setPdfCargando] = useState(null) // receta id loading
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { cargarRecetas() }, [pacienteId])

  async function cargarRecetas() {
    setCargandoLista(true)
    try {
      const res = await recetasApi.listar(pacienteId)
      setRecetas(res.data.results ?? res.data)
    } finally {
      setCargandoLista(false)
    }
  }

  async function abrirPdf(id) {
    setPdfCargando(id)
    try {
      const res = await recetasApi.pdf(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } catch {
      alert('No se pudo generar el PDF.')
    } finally {
      setPdfCargando(null)
    }
  }

  async function eliminarReceta(id) {
    if (!confirm('¿Eliminar esta receta? Esta acción no se puede deshacer.')) return
    try {
      await recetasApi.eliminar(id)
      setRecetas(r => r.filter(x => x.id !== id))
    } catch {
      alert('No se pudo eliminar la receta.')
    }
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!form.diagnostico.trim() || !form.indicaciones.trim()) {
      setError('El diagnóstico y las indicaciones son obligatorios.')
      return
    }
    setError('')
    setGuardando(true)
    try {
      const res = await recetasApi.crear({ paciente: pacienteId, ...form })
      const nuevaReceta = res.data
      setRecetas(r => [nuevaReceta, ...r])
      setForm({ fecha: hoy, peso: '', talla: '', diagnostico: '', indicaciones: '' })
      await abrirPdf(nuevaReceta.id)
    } catch {
      setError('No se pudo guardar la receta. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const formatFecha = (iso) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="recetas-tab">

      {/* Historial */}
      <div className="info-section tarjeta">
        <h3 className="info-titulo">Historial de recetas</h3>
        {cargandoLista ? (
          <p className="sin-registros">Cargando…</p>
        ) : recetas.length === 0 ? (
          <p className="sin-registros">No hay recetas guardadas para este paciente.</p>
        ) : (
          <div className="recetas-lista">
            {recetas.map(r => (
              <div key={r.id} className="receta-card tarjeta">
                <div className="receta-card-header">
                  <div>
                    <span className="receta-fecha">{formatFecha(r.fecha)}</span>
                    <p className="receta-diagnostico">{r.diagnostico}</p>
                  </div>
                  <div className="receta-card-acciones">
                    <button
                      className="btn btn-secundario btn-sm"
                      onClick={() => abrirPdf(r.id)}
                      disabled={pdfCargando === r.id}
                    >
                      {pdfCargando === r.id ? 'Generando…' : '↓ Ver PDF'}
                    </button>
                    <button
                      className="btn btn-peligro btn-sm"
                      onClick={() => eliminarReceta(r.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nueva receta */}
      <div className="info-section tarjeta receta-form">
        <h3 className="info-titulo">Nueva receta médica</h3>

        <div className="receta-paciente-info">
          <span className="campo-display"><dt>Paciente</dt><dd>{paciente.nombre_completo}</dd></span>
          <span className="campo-display"><dt>Edad</dt><dd>{edad} años</dd></span>
        </div>

        <form onSubmit={handleGuardar}>
          <div className="receta-fila-3">
            <div className="campo-grupo">
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
            </div>
            <div className="campo-grupo">
              <label>Peso (kg)</label>
              <input type="text" placeholder="ej. 72" value={form.peso} onChange={e => set('peso', e.target.value)} />
            </div>
            <div className="campo-grupo">
              <label>Talla (cm)</label>
              <input type="text" placeholder="ej. 170" value={form.talla} onChange={e => set('talla', e.target.value)} />
            </div>
          </div>

          <div className="campo-grupo" style={{ marginTop: 14 }}>
            <label>Diagnóstico</label>
            <input
              type="text"
              placeholder="Diagnóstico principal"
              value={form.diagnostico}
              onChange={e => set('diagnostico', e.target.value)}
            />
          </div>

          <div className="campo-grupo" style={{ marginTop: 14 }}>
            <label>Indicaciones médicas</label>
            <textarea
              rows={10}
              placeholder={'Ej.\n1. Metformina 850mg — 1 tableta con el desayuno y cena\n2. Reposo relativo\n3. Dieta baja en carbohidratos...'}
              value={form.indicaciones}
              onChange={e => set('indicaciones', e.target.value)}
              style={{ minHeight: 200, fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: 1.6 }}
            />
          </div>

          {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

          <div className="form-acciones" style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primario" disabled={guardando}>
              {guardando ? 'Guardando…' : '↓ Guardar y generar PDF'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
