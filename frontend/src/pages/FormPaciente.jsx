import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { pacientesApi } from '../services/api'
import './FormPaciente.css'

const INIT = {
  nombre: '', apellido_paterno: '', apellido_materno: '',
  fecha_nacimiento: '', sexo: 'M', estado_civil: 'S',
  tipo_sangre: '', curp: '', rfc: '',
  telefono: '', telefono_emergencia: '', contacto_emergencia: '', email: '',
  calle: '', colonia: '', ciudad: '', estado: '', codigo_postal: '',
  alergias: '', enfermedades_cronicas: '', medicamentos_actuales: '', notas: '',
  activo: true,
}

export default function FormPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(id)
  const [datos, setDatos] = useState(INIT)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)

  useEffect(() => {
    if (esEdicion) cargarPaciente()
  }, [id])

  async function cargarPaciente() {
    try {
      const res = await pacientesApi.obtener(id)
      const p = res.data
      setDatos({
        nombre: p.nombre || '', apellido_paterno: p.apellido_paterno || '',
        apellido_materno: p.apellido_materno || '', fecha_nacimiento: p.fecha_nacimiento || '',
        sexo: p.sexo || 'M', estado_civil: p.estado_civil || 'S',
        tipo_sangre: p.tipo_sangre || '', curp: p.curp || '', rfc: p.rfc || '',
        telefono: p.telefono || '', telefono_emergencia: p.telefono_emergencia || '',
        contacto_emergencia: p.contacto_emergencia || '', email: p.email || '',
        calle: p.calle || '', colonia: p.colonia || '', ciudad: p.ciudad || '',
        estado: p.estado || '', codigo_postal: p.codigo_postal || '',
        alergias: p.alergias || '', enfermedades_cronicas: p.enfermedades_cronicas || '',
        medicamentos_actuales: p.medicamentos_actuales || '', notas: p.notas || '',
        activo: p.activo,
      })
    } catch {
      setErrorGeneral('No se pudo cargar el paciente.')
    }
  }

  function cambiar(e) {
    const { name, value, type, checked } = e.target
    setDatos(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }))
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setErrorGeneral(null)
    try {
      if (esEdicion) {
        await pacientesApi.actualizar(id, datos)
        navigate(`/pacientes/${id}`)
      } else {
        const res = await pacientesApi.crear(datos)
        navigate(`/pacientes/${res.data.id}`)
      }
    } catch (err) {
      if (err.response?.data) {
        setErrores(err.response.data)
      }
      setErrorGeneral('Error al guardar. Revisa los campos marcados.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="form-paciente">
      <div className="form-nav">
        <Link to={esEdicion ? `/pacientes/${id}` : '/'} className="volver">
          ← {esEdicion ? 'Regresar al expediente' : 'Regresar a pacientes'}
        </Link>
      </div>
      <h1>{esEdicion ? 'Editar paciente' : 'Nuevo paciente'}</h1>

      {errorGeneral && <div className="error-msg">{errorGeneral}</div>}

      <form onSubmit={guardar}>
        <Seccion titulo="Datos personales">
          <div className="grid-3">
            <Campo label="Nombre *" error={errores.nombre}>
              <input name="nombre" value={datos.nombre} onChange={cambiar} required />
            </Campo>
            <Campo label="Apellido paterno *" error={errores.apellido_paterno}>
              <input name="apellido_paterno" value={datos.apellido_paterno} onChange={cambiar} required />
            </Campo>
            <Campo label="Apellido materno" error={errores.apellido_materno}>
              <input name="apellido_materno" value={datos.apellido_materno} onChange={cambiar} />
            </Campo>
            <Campo label="Fecha de nacimiento *" error={errores.fecha_nacimiento}>
              <input type="date" name="fecha_nacimiento" value={datos.fecha_nacimiento} onChange={cambiar} required />
            </Campo>
            <Campo label="Sexo *" error={errores.sexo}>
              <select name="sexo" value={datos.sexo} onChange={cambiar}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </Campo>
            <Campo label="Estado civil" error={errores.estado_civil}>
              <select name="estado_civil" value={datos.estado_civil} onChange={cambiar}>
                <option value="S">Soltero/a</option>
                <option value="C">Casado/a</option>
                <option value="D">Divorciado/a</option>
                <option value="V">Viudo/a</option>
                <option value="U">Unión libre</option>
              </select>
            </Campo>
            <Campo label="Tipo de sangre" error={errores.tipo_sangre}>
              <select name="tipo_sangre" value={datos.tipo_sangre} onChange={cambiar}>
                <option value="">No especificado</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Campo>
            <Campo label="CURP" error={errores.curp}>
              <input name="curp" value={datos.curp} onChange={cambiar} maxLength={18} style={{textTransform:'uppercase'}} />
            </Campo>
            <Campo label="RFC" error={errores.rfc}>
              <input name="rfc" value={datos.rfc} onChange={cambiar} maxLength={13} style={{textTransform:'uppercase'}} />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Contacto">
          <div className="grid-3">
            <Campo label="Teléfono *" error={errores.telefono}>
              <input name="telefono" value={datos.telefono} onChange={cambiar} required />
            </Campo>
            <Campo label="Correo electrónico" error={errores.email}>
              <input type="email" name="email" value={datos.email} onChange={cambiar} />
            </Campo>
            <Campo label="Contacto de emergencia" error={errores.contacto_emergencia}>
              <input name="contacto_emergencia" value={datos.contacto_emergencia} onChange={cambiar} />
            </Campo>
            <Campo label="Teléfono de emergencia" error={errores.telefono_emergencia}>
              <input name="telefono_emergencia" value={datos.telefono_emergencia} onChange={cambiar} />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Dirección">
          <div className="grid-3">
            <Campo label="Calle y número *" error={errores.calle} span={2}>
              <input name="calle" value={datos.calle} onChange={cambiar} required />
            </Campo>
            <Campo label="Colonia" error={errores.colonia}>
              <input name="colonia" value={datos.colonia} onChange={cambiar} />
            </Campo>
            <Campo label="Ciudad *" error={errores.ciudad}>
              <input name="ciudad" value={datos.ciudad} onChange={cambiar} required />
            </Campo>
            <Campo label="Estado *" error={errores.estado}>
              <input name="estado" value={datos.estado} onChange={cambiar} required />
            </Campo>
            <Campo label="Código postal" error={errores.codigo_postal}>
              <input name="codigo_postal" value={datos.codigo_postal} onChange={cambiar} maxLength={10} />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Información médica">
          <div className="grid-2">
            <Campo label="Alergias conocidas" error={errores.alergias}>
              <textarea name="alergias" value={datos.alergias} onChange={cambiar} />
            </Campo>
            <Campo label="Enfermedades crónicas" error={errores.enfermedades_cronicas}>
              <textarea name="enfermedades_cronicas" value={datos.enfermedades_cronicas} onChange={cambiar} />
            </Campo>
            <Campo label="Medicamentos actuales" error={errores.medicamentos_actuales}>
              <textarea name="medicamentos_actuales" value={datos.medicamentos_actuales} onChange={cambiar} />
            </Campo>
            <Campo label="Notas adicionales" error={errores.notas}>
              <textarea name="notas" value={datos.notas} onChange={cambiar} />
            </Campo>
          </div>
          <label className="check-activo">
            <input type="checkbox" name="activo" checked={datos.activo} onChange={cambiar} />
            Paciente activo
          </label>
        </Seccion>

        <div className="form-acciones">
          <Link to={esEdicion ? `/pacientes/${id}` : '/'} className="btn btn-secundario">Cancelar</Link>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="form-seccion tarjeta">
      <h3 className="seccion-titulo">{titulo}</h3>
      {children}
    </div>
  )
}

function Campo({ label, children, error, span }) {
  return (
    <div className="campo-grupo" style={span ? { gridColumn: `span ${span}` } : {}}>
      <label>{label}</label>
      {children}
      {error && <span className="campo-error">{Array.isArray(error) ? error[0] : error}</span>}
    </div>
  )
}
