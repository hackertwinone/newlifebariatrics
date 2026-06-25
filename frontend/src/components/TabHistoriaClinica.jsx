import { useState, useEffect } from 'react'
import { historiaApi, consultasApi } from '../services/api'
import './TabHistoriaClinica.css'

const EVENTOS_OPCIONES = ['Embarazo', 'Cambio laboral', 'Sedentarismo']

const INIT_HISTORIA = {
  fecha_realizada: '', doctor_que_realizo: '', motivo_consulta: '',
  peso_actual: '', peso_maximo_historico: '', peso_mas_bajo_adulto: '',
  peso_adolescencia: '', edad_inicio_aumento_peso: '',
  eventos_asociados_aumento_peso: [],
  intentos_previos_perder_peso: '', especifique_intentos: '',
  medicamentos_usados: '', resultados_obtenidos: '',
  peso: '', talla: '', imc: '',
  porcentaje_grasa_corporal: '', porcentaje_grasa_visceral: '', masa_muscular: '',
  cirugias_previas: '', hospitalizaciones_previas: '',
  tabaquismo: '', alcohol: '', actividad_fisica: '',
  horas_sueno: '', calidad_sueno: '',
  numero_comidas_dia: '', desayuno_habitual: '', comida_habitual: '',
  cena_habitual: '', snacks: '', consumo_bebidas_azucaradas: '',
  consumo_comida_rapida: '',
  come_grandes_volumenes: false, come_rapido: false, come_por_ansiedad: false,
  come_sin_hambre: false, episodios_atracon: false, come_durante_noche: false,
  preferencia_alimento: '', especifique_preferencia: '',
  estado_emocional_actual: '', tratamiento_psicologico_previo: false,
  trastornos_conducta_alimentaria_previos: '',
  glucosa_ayuno: '', perfil_lipidico: '',
  cirugia_bariatrica: false, procedimiento_propuesto: '',
  especifique_procedimiento: '', observaciones: '', conclusiones: '',
}

function normalize(data) {
  const out = { ...INIT_HISTORIA }
  for (const k of Object.keys(INIT_HISTORIA)) {
    if (data[k] !== undefined && data[k] !== null) out[k] = data[k]
  }
  if (!Array.isArray(out.eventos_asociados_aumento_peso)) {
    out.eventos_asociados_aumento_peso = []
  }
  return out
}

export default function TabHistoriaClinica({ pacienteId }) {
  const [subTab, setSubTab] = useState('evaluacion')

  return (
    <div className="historia-clinica">
      <div className="historia-subtabs">
        {[['evaluacion', 'Evaluación Inicial'], ['consultas', 'Consultas']].map(([k, label]) => (
          <button
            key={k}
            className={`historia-subtab-btn ${subTab === k ? 'activa' : ''}`}
            onClick={() => setSubTab(k)}
          >{label}</button>
        ))}
      </div>

      {subTab === 'evaluacion' && <EvaluacionInicial pacienteId={pacienteId} />}
      {subTab === 'consultas' && <TabConsultas pacienteId={pacienteId} />}
    </div>
  )
}

// ── Evaluación Inicial ─────────────────────────────────────────────────────

function EvaluacionInicial({ pacienteId }) {
  const [form, setForm] = useState(INIT_HISTORIA)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { cargar() }, [pacienteId])

  // Auto-calculate IMC when peso/talla change (unless user manually edited imc)
  const [imcManual, setImcManual] = useState(false)
  useEffect(() => {
    if (imcManual) return
    const p = parseFloat(form.peso)
    const t = parseFloat(form.talla)
    if (p > 0 && t > 0) {
      const tm = t / 100
      setForm(f => ({ ...f, imc: (p / (tm * tm)).toFixed(1) }))
    }
  }, [form.peso, form.talla])

  async function cargar() {
    setCargando(true)
    try {
      const res = await historiaApi.obtener(pacienteId)
      setForm(normalize(res.data))
    } catch {
      setError('No se pudo cargar la historia clínica.')
    } finally {
      setCargando(false)
    }
  }

  function set(e) {
    const { name, value, type, checked } = e.target
    if (name === 'imc') setImcManual(true)
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function toggleEvento(opcion) {
    setForm(f => {
      const cur = f.eventos_asociados_aumento_peso
      return {
        ...f,
        eventos_asociados_aumento_peso: cur.includes(opcion)
          ? cur.filter(x => x !== opcion)
          : [...cur, opcion],
      }
    })
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setGuardado(false)
    try {
      await historiaApi.guardar(pacienteId, form)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <div className="cargando">Cargando historia clínica…</div>

  return (
    <form onSubmit={guardar} className="historia-form">

      {/* Encabezado */}
      <Seccion titulo="Encabezado">
        <div className="grid-2">
          <Campo label="Fecha de realización">
            <input type="datetime-local" name="fecha_realizada" value={form.fecha_realizada} onChange={set} />
          </Campo>
          <Campo label="Doctor que realizó">
            <input type="text" name="doctor_que_realizo" value={form.doctor_que_realizo} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Motivo de Consulta */}
      <Seccion titulo="Motivo de Consulta">
        <Campo label="Motivo">
          <textarea name="motivo_consulta" rows={3} value={form.motivo_consulta} onChange={set} />
        </Campo>
      </Seccion>

      {/* Historia del Peso */}
      <Seccion titulo="Historia del Peso">
        <div className="grid-3">
          <Campo label="Peso actual (kg)">
            <input type="number" step="0.1" name="peso_actual" value={form.peso_actual} onChange={set} />
          </Campo>
          <Campo label="Peso máximo histórico (kg)">
            <input type="number" step="0.1" name="peso_maximo_historico" value={form.peso_maximo_historico} onChange={set} />
          </Campo>
          <Campo label="Peso más bajo adulto (kg)">
            <input type="number" step="0.1" name="peso_mas_bajo_adulto" value={form.peso_mas_bajo_adulto} onChange={set} />
          </Campo>
          <Campo label="Peso en adolescencia">
            <input type="text" name="peso_adolescencia" value={form.peso_adolescencia} onChange={set} />
          </Campo>
          <Campo label="Edad inicio aumento de peso">
            <input type="text" name="edad_inicio_aumento_peso" value={form.edad_inicio_aumento_peso} onChange={set} />
          </Campo>
        </div>
        <Campo label="Eventos asociados al aumento de peso">
          <div className="check-group">
            {EVENTOS_OPCIONES.map(op => (
              <label key={op} className="check-item">
                <input
                  type="checkbox"
                  checked={form.eventos_asociados_aumento_peso.includes(op)}
                  onChange={() => toggleEvento(op)}
                />
                {op}
              </label>
            ))}
          </div>
        </Campo>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <Campo label="Intentos previos de perder peso">
            <input type="text" name="intentos_previos_perder_peso" value={form.intentos_previos_perder_peso} onChange={set} />
          </Campo>
          <Campo label="Especifique intentos">
            <input type="text" name="especifique_intentos" value={form.especifique_intentos} onChange={set} />
          </Campo>
          <Campo label="Medicamentos usados">
            <input type="text" name="medicamentos_usados" value={form.medicamentos_usados} onChange={set} />
          </Campo>
          <Campo label="Resultados obtenidos">
            <textarea name="resultados_obtenidos" rows={2} value={form.resultados_obtenidos} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Composición Corporal */}
      <Seccion titulo="Composición Corporal">
        <div className="grid-3">
          <Campo label="Peso (kg)">
            <input type="number" step="0.1" name="peso" value={form.peso} onChange={set} />
          </Campo>
          <Campo label="Talla (cm)">
            <input type="number" step="0.1" name="talla" value={form.talla} onChange={set} />
          </Campo>
          <Campo label="IMC (auto)">
            <input
              type="number" step="0.1" name="imc"
              value={form.imc}
              onChange={e => { setImcManual(true); set(e) }}
              placeholder="Auto-calculado"
            />
          </Campo>
          <Campo label="% Grasa corporal">
            <input type="number" step="0.1" name="porcentaje_grasa_corporal" value={form.porcentaje_grasa_corporal} onChange={set} />
          </Campo>
          <Campo label="% Grasa visceral">
            <input type="number" step="0.1" name="porcentaje_grasa_visceral" value={form.porcentaje_grasa_visceral} onChange={set} />
          </Campo>
          <Campo label="Masa muscular (kg)">
            <input type="number" step="0.1" name="masa_muscular" value={form.masa_muscular} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Antecedentes */}
      <Seccion titulo="Antecedentes">
        <div className="grid-2">
          <Campo label="Cirugías previas">
            <textarea name="cirugias_previas" rows={3} value={form.cirugias_previas} onChange={set} />
          </Campo>
          <Campo label="Hospitalizaciones previas">
            <textarea name="hospitalizaciones_previas" rows={3} value={form.hospitalizaciones_previas} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Estilo de Vida */}
      <Seccion titulo="Evaluación del Estilo de Vida">
        <div className="grid-3">
          <Campo label="Tabaquismo">
            <select name="tabaquismo" value={form.tabaquismo} onChange={set}>
              <option value="">— Seleccionar —</option>
              <option value="nunca">Nunca</option>
              <option value="ocasional">Ocasional</option>
              <option value="frecuente">Frecuente</option>
              <option value="exfumador">Exfumador</option>
            </select>
          </Campo>
          <Campo label="Alcohol">
            <select name="alcohol" value={form.alcohol} onChange={set}>
              <option value="">— Seleccionar —</option>
              <option value="nunca">Nunca</option>
              <option value="social">Social</option>
              <option value="frecuente">Frecuente</option>
            </select>
          </Campo>
          <Campo label="Actividad física">
            <select name="actividad_fisica" value={form.actividad_fisica} onChange={set}>
              <option value="">— Seleccionar —</option>
              <option value="sedentario">Sedentario</option>
              <option value="ligera">Ligera</option>
              <option value="moderada">Moderada</option>
              <option value="intensa">Intensa</option>
            </select>
          </Campo>
          <Campo label="Horas de sueño">
            <input type="text" name="horas_sueno" value={form.horas_sueno} onChange={set} />
          </Campo>
          <Campo label="Calidad del sueño">
            <select name="calidad_sueno" value={form.calidad_sueno} onChange={set}>
              <option value="">— Seleccionar —</option>
              <option value="buena">Buena</option>
              <option value="interrumpida">Interrumpida</option>
              <option value="mala">Mala</option>
            </select>
          </Campo>
        </div>
      </Seccion>

      {/* Patrón de Alimentación */}
      <Seccion titulo="Patrón de Alimentación">
        <div className="grid-3">
          <Campo label="Número de comidas al día">
            <input type="number" min="0" name="numero_comidas_dia" value={form.numero_comidas_dia} onChange={set} />
          </Campo>
          <Campo label="Consumo bebidas azucaradas">
            <select name="consumo_bebidas_azucaradas" value={form.consumo_bebidas_azucaradas} onChange={set}>
              <option value="">— Seleccionar —</option>
              <option value="nunca">Nunca</option>
              <option value="ocasional">Ocasional</option>
              <option value="frecuente">Frecuente</option>
            </select>
          </Campo>
          <Campo label="Consumo comida rápida">
            <input type="text" name="consumo_comida_rapida" value={form.consumo_comida_rapida} onChange={set} />
          </Campo>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <Campo label="Desayuno habitual">
            <input type="text" name="desayuno_habitual" value={form.desayuno_habitual} onChange={set} />
          </Campo>
          <Campo label="Comida habitual">
            <input type="text" name="comida_habitual" value={form.comida_habitual} onChange={set} />
          </Campo>
          <Campo label="Cena habitual">
            <input type="text" name="cena_habitual" value={form.cena_habitual} onChange={set} />
          </Campo>
          <Campo label="Snacks">
            <input type="text" name="snacks" value={form.snacks} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Conductual / Emocional */}
      <Seccion titulo="Evaluación Conductual Alimentaria y Estado Emocional">
        <div className="bool-group">
          {[
            ['come_grandes_volumenes', 'Come grandes volúmenes'],
            ['come_rapido', 'Come rápido'],
            ['come_por_ansiedad', 'Come por ansiedad'],
            ['come_sin_hambre', 'Come sin hambre'],
            ['episodios_atracon', 'Episodios de atracón'],
            ['come_durante_noche', 'Come durante la noche'],
            ['tratamiento_psicologico_previo', 'Tratamiento psicológico previo'],
          ].map(([name, label]) => (
            <label key={name} className="check-item">
              <input type="checkbox" name={name} checked={form[name]} onChange={set} />
              {label}
            </label>
          ))}
        </div>
        <div className="grid-2" style={{ marginTop: 14 }}>
          <Campo label="Preferencia de alimento">
            <input type="text" name="preferencia_alimento" value={form.preferencia_alimento} onChange={set} />
          </Campo>
          <Campo label="Especifique preferencia">
            <input type="text" name="especifique_preferencia" value={form.especifique_preferencia} onChange={set} />
          </Campo>
          <Campo label="Estado emocional actual">
            <select name="estado_emocional_actual" value={form.estado_emocional_actual} onChange={set}>
              <option value="">— Seleccionar —</option>
              <option value="estable">Estable</option>
              <option value="ansioso">Ansioso</option>
              <option value="deprimido">Deprimido</option>
              <option value="otro">Otro</option>
            </select>
          </Campo>
          <Campo label="Trastornos de conducta alimentaria previos">
            <input type="text" name="trastornos_conducta_alimentaria_previos" value={form.trastornos_conducta_alimentaria_previos} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Evaluación Metabólica */}
      <Seccion titulo="Evaluación Metabólica">
        <div className="grid-2">
          <Campo label="Glucosa en ayuno (mg/dL)">
            <input type="number" step="0.1" name="glucosa_ayuno" value={form.glucosa_ayuno} onChange={set} />
          </Campo>
          <Campo label="Perfil lipídico">
            <textarea name="perfil_lipidico" rows={3} value={form.perfil_lipidico} onChange={set} />
          </Campo>
        </div>
      </Seccion>

      {/* Plan de Tratamiento */}
      <Seccion titulo="Plan de Tratamiento">
        <label className="check-item" style={{ marginBottom: 14 }}>
          <input type="checkbox" name="cirugia_bariatrica" checked={form.cirugia_bariatrica} onChange={set} />
          Cirugía bariátrica indicada
        </label>
        <div className="grid-2">
          <Campo label="Procedimiento propuesto">
            <input type="text" name="procedimiento_propuesto" value={form.procedimiento_propuesto} onChange={set} />
          </Campo>
          <Campo label="Especifique procedimiento">
            <input type="text" name="especifique_procedimiento" value={form.especifique_procedimiento} onChange={set} />
          </Campo>
        </div>
        <Campo label="Observaciones" style={{ marginTop: 12 }}>
          <textarea name="observaciones" rows={3} value={form.observaciones} onChange={set} />
        </Campo>
        <Campo label="Conclusiones">
          <textarea name="conclusiones" rows={3} value={form.conclusiones} onChange={set} />
        </Campo>
      </Seccion>

      {error && <p className="error-msg">{error}</p>}

      <div className="form-acciones">
        {guardado && <span className="guardado-ok">✓ Guardado</span>}
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar evaluación'}
        </button>
      </div>

    </form>
  )
}

// ── Consultas ──────────────────────────────────────────────────────────────

function TabConsultas({ pacienteId }) {
  const ahoraLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)

  const [consultas, setConsultas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({ fecha: ahoraLocal(), doctor: '', peso: '', notas: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { cargar() }, [pacienteId])

  async function cargar() {
    setCargando(true)
    try {
      const res = await consultasApi.listar(pacienteId)
      setConsultas(res.data.results ?? res.data)
    } finally {
      setCargando(false)
    }
  }

  function setF(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function agregar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const payload = { paciente: pacienteId, ...form, peso: form.peso || null }
      const res = await consultasApi.crear(payload)
      setConsultas(c => [res.data, ...c])
      setForm({ fecha: ahoraLocal(), doctor: '', peso: '', notas: '' })
      setMostrarForm(false)
    } catch {
      setError('No se pudo guardar la consulta.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta consulta?')) return
    try {
      await consultasApi.eliminar(id)
      setConsultas(c => c.filter(x => x.id !== id))
    } catch {
      alert('No se pudo eliminar.')
    }
  }

  const fmt = iso => new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="consultas-tab">

      <div className="tab-encabezado">
        <h3>Historial de consultas</h3>
        <button className="btn btn-primario btn-sm" onClick={() => setMostrarForm(f => !f)}>
          {mostrarForm ? 'Cancelar' : '+ Agregar consulta'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={agregar} className="info-section tarjeta consulta-form">
          <h3 className="info-titulo">Nueva consulta</h3>
          <div className="grid-2">
            <Campo label="Fecha y hora">
              <input type="datetime-local" name="fecha" value={form.fecha} onChange={setF} required />
            </Campo>
            <Campo label="Doctor">
              <input type="text" name="doctor" value={form.doctor} onChange={setF} />
            </Campo>
            <Campo label="Peso (kg) — opcional">
              <input type="number" step="0.1" name="peso" value={form.peso} onChange={setF} placeholder="ej. 95.5" />
            </Campo>
          </div>
          <Campo label="Notas de la consulta" style={{ marginTop: 12 }}>
            <textarea name="notas" rows={5} value={form.notas} onChange={setF} />
          </Campo>
          {error && <p className="error-msg" style={{ marginTop: 8 }}>{error}</p>}
          <div className="form-acciones" style={{ marginTop: 16 }}>
            <button type="submit" className="btn btn-primario" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar consulta'}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p className="sin-registros">Cargando…</p>
      ) : consultas.length === 0 ? (
        <p className="sin-registros">No hay consultas registradas.</p>
      ) : (
        <div className="tarjetas-lista">
          {consultas.map(c => (
            <div key={c.id} className="registro-tarjeta tarjeta">
              <div className="registro-encabezado">
                <div>
                  <strong>{fmt(c.fecha)}</strong>
                  {c.doctor && <span className="consulta-doctor"> · {c.doctor}</span>}
                  {c.peso && <span className="badge badge-gris" style={{ marginLeft: 8 }}>{c.peso} kg</span>}
                </div>
                <div className="registro-acciones">
                  <button className="btn btn-peligro btn-sm" onClick={() => eliminar(c.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
              {c.notas && <p className="consulta-notas">{c.notas}</p>}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function Seccion({ titulo, children }) {
  return (
    <div className="info-section tarjeta historia-seccion">
      <h3 className="info-titulo">{titulo}</h3>
      {children}
    </div>
  )
}

function Campo({ label, children, style }) {
  return (
    <div className="campo-grupo" style={style}>
      <label>{label}</label>
      {children}
    </div>
  )
}
