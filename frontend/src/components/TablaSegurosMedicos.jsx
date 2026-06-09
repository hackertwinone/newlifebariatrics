import { useState } from 'react'
import { segurosApi } from '../services/api'
import './TablaRegistros.css'

const INIT_SEGURO = {
  aseguradora: '', numero_poliza: '', numero_grupo: '',
  nombre_titular: '', parentesco_titular: '',
  vigencia_inicio: '', vigencia_fin: '',
  telefono_aseguradora: '', cobertura_descripcion: '', activo: true,
}

export default function TablaSegurosMedicos({ pacienteId, seguros, onActualizar }) {
  const [mostrando, setMostrando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [datos, setDatos] = useState(INIT_SEGURO)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() { setDatos({ ...INIT_SEGURO, paciente: pacienteId }); setEditando(null); setMostrando(true) }
  function abrirEdicion(s) { setDatos({ ...s }); setEditando(s.id); setMostrando(true) }
  function cerrar() { setMostrando(false); setEditando(null) }
  function cambiar(e) {
    const { name, value, type, checked } = e.target
    setDatos(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = { ...datos, paciente: pacienteId }
      if (editando) await segurosApi.actualizar(editando, payload)
      else await segurosApi.crear(payload)
      onActualizar()
      cerrar()
    } catch { alert('Error al guardar el seguro.') }
    finally { setGuardando(false) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este seguro?')) return
    try { await segurosApi.eliminar(id); onActualizar() }
    catch { alert('Error al eliminar.') }
  }

  return (
    <div className="tab-contenido">
      <div className="tab-encabezado">
        <h3>Seguros médicos</h3>
        <button className="btn btn-primario" onClick={abrirNuevo}>+ Agregar seguro</button>
      </div>

      {seguros.length === 0 ? (
        <div className="sin-registros tarjeta">No hay seguros registrados para este paciente.</div>
      ) : (
        <div className="tarjetas-lista">
          {seguros.map(s => (
            <div key={s.id} className="registro-tarjeta tarjeta">
              <div className="registro-encabezado">
                <div>
                  <strong>{s.aseguradora}</strong>
                  <span className={`badge ${s.activo ? 'badge-verde' : 'badge-gris'}`}>{s.activo ? 'Vigente' : 'Vencido'}</span>
                </div>
                <div className="registro-acciones">
                  <button className="btn btn-sm btn-secundario" onClick={() => abrirEdicion(s)}>Editar</button>
                  <button className="btn btn-sm btn-peligro" onClick={() => eliminar(s.id)}>Eliminar</button>
                </div>
              </div>
              <div className="registro-grid">
                <RegistroCampo label="N° de póliza" valor={s.numero_poliza} />
                <RegistroCampo label="N° de grupo" valor={s.numero_grupo} />
                <RegistroCampo label="Titular" valor={s.nombre_titular} />
                <RegistroCampo label="Parentesco" valor={s.parentesco_titular} />
                <RegistroCampo label="Vigencia desde" valor={s.vigencia_inicio} />
                <RegistroCampo label="Vigencia hasta" valor={s.vigencia_fin || 'Sin fecha'} />
                <RegistroCampo label="Tel. aseguradora" valor={s.telefono_aseguradora} />
                {s.cobertura_descripcion && <RegistroCampo label="Cobertura" valor={s.cobertura_descripcion} span={2} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrando && (
        <div className="modal-overlay" onClick={cerrar}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-titulo">
              <h3>{editando ? 'Editar seguro' : 'Agregar seguro médico'}</h3>
              <button className="modal-cerrar" onClick={cerrar}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-grid">
                <div className="campo-grupo"><label>Aseguradora *</label><input name="aseguradora" value={datos.aseguradora} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>N° de póliza *</label><input name="numero_poliza" value={datos.numero_poliza} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>N° de grupo</label><input name="numero_grupo" value={datos.numero_grupo} onChange={cambiar} /></div>
                <div className="campo-grupo"><label>Nombre del titular *</label><input name="nombre_titular" value={datos.nombre_titular} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>Parentesco</label><input name="parentesco_titular" value={datos.parentesco_titular} onChange={cambiar} /></div>
                <div className="campo-grupo"><label>Teléfono aseguradora</label><input name="telefono_aseguradora" value={datos.telefono_aseguradora} onChange={cambiar} /></div>
                <div className="campo-grupo"><label>Vigencia desde *</label><input type="date" name="vigencia_inicio" value={datos.vigencia_inicio} onChange={cambiar} required /></div>
                <div className="campo-grupo"><label>Vigencia hasta</label><input type="date" name="vigencia_fin" value={datos.vigencia_fin || ''} onChange={cambiar} /></div>
                <div className="campo-grupo" style={{gridColumn:'span 2'}}><label>Descripción de cobertura</label><textarea name="cobertura_descripcion" value={datos.cobertura_descripcion} onChange={cambiar} /></div>
                <label className="check-activo"><input type="checkbox" name="activo" checked={datos.activo} onChange={cambiar} /> Seguro vigente</label>
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
