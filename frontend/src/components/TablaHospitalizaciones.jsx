import { useState } from 'react'
import { hospitalizacionesApi } from '../services/api'
import './TablaRegistros.css'

const MOTIVOS = [
  ['CIR','Cirugía programada'],['URG','Urgencia'],['OBS','Observación'],
  ['MAT','Maternidad'],['DIA','Estudio diagnóstico'],['OTR','Otro'],
]
const ESTADOS = [
  ['ING','Ingresado'],['INT','En tratamiento'],['ALT','Alta médica'],
  ['TRA','Transferido'],['FAL','Fallecido'],
]

const BADGE_ESTADO = { ING:'badge-azul', INT:'badge-amarillo', ALT:'badge-verde', TRA:'badge-gris', FAL:'badge-rojo' }

const INIT = {
  hospital: '', numero_expediente: '', cama: '',
  motivo: 'URG', diagnostico_ingreso: '', diagnostico_egreso: '',
  medico_responsable: '', fecha_ingreso: '', fecha_egreso: '',
  estado: 'ING', procedimientos: '', observaciones: '',
}

export default function TablaHospitalizaciones({ pacienteId, hospitalizaciones, onActualizar }) {
  const [mostrando, setMostrando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [datos, setDatos] = useState(INIT)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() { setDatos({ ...INIT }); setEditando(null); setMostrando(true) }
  function abrirEdicion(h) {
    setDatos({
      ...h,
      fecha_ingreso: h.fecha_ingreso ? h.fecha_ingreso.slice(0,16) : '',
      fecha_egreso: h.fecha_egreso ? h.fecha_egreso.slice(0,16) : '',
    })
    setEditando(h.id); setMostrando(true)
  }
  function cerrar() { setMostrando(false); setEditando(null) }
  function cambiar(e) { const { name, value } = e.target; setDatos(prev => ({ ...prev, [name]: value })) }

  async function guardar(e) {
    e.preventDefault(); setGuardando(true)
    try {
      const payload = { ...datos, paciente: pacienteId }
      if (editando) await hospitalizacionesApi.actualizar(editando, payload)
      else await hospitalizacionesApi.crear(payload)
      onActualizar(); cerrar()
    } catch { alert('Error al guardar la hospitalización.') }
    finally { setGuardando(false) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta hospitalización?')) return
    try { await hospitalizacionesApi.eliminar(id); onActualizar() }
    catch { alert('Error al eliminar.') }
  }

  const fmtFecha = dt => dt ? new Date(dt).toLocaleString('es-MX', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'

  return (
    <div className="tab-contenido">
      <div className="tab-encabezado">
        <h3>Hospitalizaciones</h3>
        <button className="btn btn-primario" onClick={abrirNuevo}>+ Registrar hospitalización</button>
      </div>

      {hospitalizaciones.length === 0 ? (
        <div className="sin-registros tarjeta">No hay hospitalizaciones registradas.</div>
      ) : (
        <div className="tarjetas-lista">
          {hospitalizaciones.map(h => (
            <div key={h.id} className="registro-tarjeta tarjeta">
              <div className="registro-encabezado">
                <div>
                  <strong>{h.hospital}</strong>
                  <span className={`badge ${BADGE_ESTADO[h.estado] || 'badge-gris'}`}>
                    {ESTADOS.find(e => e[0] === h.estado)?.[1] || h.estado}
                  </span>
                  <span className="badge badge-azul">{MOTIVOS.find(m => m[0] === h.motivo)?.[1]}</span>
                </div>
                <div className="registro-acciones">
                  <button className="btn btn-sm btn-secundario" onClick={() => abrirEdicion(h)}>Editar</button>
                  <button className="btn btn-sm btn-peligro" onClick={() => eliminar(h.id)}>Eliminar</button>
                </div>
              </div>
              <div className="registro-grid">
                <RegistroCampo label="Ingreso" valor={fmtFecha(h.fecha_ingreso)} />
                <RegistroCampo label="Egreso" valor={fmtFecha(h.fecha_egreso)} />
                <RegistroCampo label="Médico" valor={h.medico_responsable} />
                <RegistroCampo label="Expediente" valor={h.numero_expediente} />
                <RegistroCampo label="Cama / Cuarto" valor={h.cama} />
                <RegistroCampo label="Diagnóstico de ingreso" valor={h.diagnostico_ingreso} span={3} />
                {h.diagnostico_egreso && <RegistroCampo label="Diagnóstico de egreso" valor={h.diagnostico_egreso} span={3} />}
                {h.procedimientos && <RegistroCampo label="Procedimientos" valor={h.procedimientos} span={3} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrando && (
        <div className="modal-overlay" onClick={cerrar}>
          <div className="modal modal-grande" onClick={e => e.stopPropagation()}>
            <div className="modal-titulo">
              <h3>{editando ? 'Editar hospitalización' : 'Registrar hospitalización'}</h3>
              <button className="modal-cerrar" onClick={cerrar}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-grid">
                <div className="campo-grupo" style={{gridColumn:'span 2'}}><label>Hospital / Clínica *</label><input name="hospital" value={datos.hospital} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>N° expediente</label><input name="numero_expediente" value={datos.numero_expediente} onChange={cambiar} /></div>
                <div className="campo-grupo"><label>Cama / Cuarto</label><input name="cama" value={datos.cama} onChange={cambiar} /></div>
                <div className="campo-grupo"><label>Motivo *</label>
                  <select name="motivo" value={datos.motivo} onChange={cambiar}>
                    {MOTIVOS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="campo-grupo"><label>Estado</label>
                  <select name="estado" value={datos.estado} onChange={cambiar}>
                    {ESTADOS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="campo-grupo"><label>Médico responsable *</label><input name="medico_responsable" value={datos.medico_responsable} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>Fecha de ingreso *</label><input type="datetime-local" name="fecha_ingreso" value={datos.fecha_ingreso} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>Fecha de egreso</label><input type="datetime-local" name="fecha_egreso" value={datos.fecha_egreso} onChange={cambiar} /></div>
                <div className="campo-grupo" style={{gridColumn:'span 2'}}><label>Diagnóstico de ingreso *</label><textarea name="diagnostico_ingreso" value={datos.diagnostico_ingreso} onChange={cambiar} required /></div>
                <div className="campo-grupo" style={{gridColumn:'span 2'}}><label>Diagnóstico de egreso</label><textarea name="diagnostico_egreso" value={datos.diagnostico_egreso} onChange={cambiar} /></div>
                <div className="campo-grupo" style={{gridColumn:'span 2'}}><label>Procedimientos realizados</label><textarea name="procedimientos" value={datos.procedimientos} onChange={cambiar} /></div>
                <div className="campo-grupo" style={{gridColumn:'span 2'}}><label>Observaciones</label><textarea name="observaciones" value={datos.observaciones} onChange={cambiar} /></div>
              </div>
              <div className="modal-acciones">
                <button type="button" className="btn btn-secundario" onClick={cerrar}>Cancelar</button>
                <button type="submit" className="btn btn-primario" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RegistroCampo({ label, valor, span }) {
  return (
    <div className="campo-display" style={span ? { gridColumn: `span ${span}` } : {}}>
      <dt>{label}</dt>
      <dd>{valor || '—'}</dd>
    </div>
  )
}
