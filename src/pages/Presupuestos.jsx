import { useState, useEffect } from 'react'
import { getPresupuestos, getClientes, crearPresupuesto, editarPresupuesto, convertirPresupuesto, addHistorial } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Textarea, Row, Btn, Select } from '../components/FormField.jsx'

const ESTADOS = ['Pendiente de aprobación', 'Aprobado', 'Rechazado', 'Vencido']

const estadoStyle = {
  'Pendiente de aprobación': { bg: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'rgba(234,179,8,0.3)' },
  Aprobado: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  Rechazado: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
  Vencido: { bg: 'rgba(148,163,184,0.1)', color: '#64748b', border: 'rgba(148,163,184,0.3)' },
}

function Badge({ estado }) {
  const s = estadoStyle[estado] || estadoStyle['Pendiente de aprobación']
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{estado}</span>
}

export default function Presupuestos({ usuario }) {
  const [presupuestos, setPresupuestos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    const [p, c] = await Promise.all([getPresupuestos(), getClientes()])
    setPresupuestos(p); setClientes(c); setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm({ validez_dias: 7 }); setError(''); setModal({ modo: 'crear' }) }
  const abrirEditar = (p) => { setForm({ ...p }); setError(''); setModal({ modo: 'editar', pres: p }) }
  const cerrar = () => setModal(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const seleccionarCliente = (id) => {
    const c = clientes.find(c => c.id === id)
    set('cliente_id', id)
    if (c) { set('cliente_nombre', c.nombre); set('telefono', c.telefono || '') }
  }

  const guardar = async () => {
    if (!form.descripcion?.trim()) { setError('La descripción es obligatoria'); return }
    setSaving(true); setError('')
    try {
      if (modal.modo === 'crear') await crearPresupuesto(form)
      else await editarPresupuesto(modal.pres.id, { estado: form.estado })
      await cargar(); cerrar()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const convertir = async (p) => {
    if (!confirm(`¿Convertir este presupuesto en orden de servicio?`)) return
    setSaving(true)
    try {
      const orden = await convertirPresupuesto(p)
      await addHistorial('CONVERTIDO', 'presupuestos', p.id, 'estado', 'Pendiente de aprobación', 'Aprobado', usuario?.nombre)
      await cargar()
      alert(`✅ Orden creada con ID: ${orden.id}`)
    } catch (e) { alert('❌ ' + e.message) } finally { setSaving(false) }
  }

  const filtrados = presupuestos.filter(p => {
    const txt = `${p.cliente_nombre} ${p.descripcion}`.toLowerCase()
    return txt.includes(buscar.toLowerCase())
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        <input value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="🔍  Buscar presupuesto..."
          style={{ flex: 1, maxWidth: 360, padding: '9px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
        <Btn onClick={abrirCrear}>+ Nuevo presupuesto</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Fecha', 'Cliente', 'Descripción', 'Monto', 'Vence', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No hay presupuestos</td></tr>
              ) : filtrados.map(p => {
                const vencido = p.fecha_vencimiento && new Date(p.fecha_vencimiento) < new Date() && p.estado === 'Pendiente de aprobación'
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 11 }}>
                      {new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{p.cliente_nombre || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</td>
                    <td style={{ padding: '11px 14px', color: '#f59e0b', fontWeight: 700 }}>$ {(parseFloat(p.monto) || 0).toLocaleString('es-AR')}</td>
                    <td style={{ padding: '11px 14px', color: vencido ? '#f87171' : '#64748b', fontSize: 11 }}>
                      {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}><Badge estado={vencido ? 'Vencido' : p.estado} /></td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <ActionBtn onClick={() => abrirEditar(p)}>✏️</ActionBtn>
                        {p.estado === 'Pendiente de aprobación' && (
                          <ActionBtn onClick={() => convertir(p)} title="Convertir en orden">✅</ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nuevo presupuesto' : 'Editar presupuesto'} onClose={cerrar} width={600}>
          {modal.modo === 'crear' ? (
            <>
              <Row>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cliente</label>
                  <select value={form.cliente_id || ''} onChange={e => seleccionarCliente(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13 }}>
                    <option value="">-- Seleccionar --</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <Input label="Teléfono" value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} />
              </Row>
              <Textarea label="Descripción *" rows={2} value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} placeholder="Servicio a cotizar..." />
              <Textarea label="Detalle / Desglose" rows={3} value={form.detalle || ''} onChange={e => set('detalle', e.target.value)} placeholder="- Mano de obra: $X\n- Materiales: $Y" />
              <Row>
                <Input label="Monto total ($)" type="number" value={form.monto || ''} onChange={e => set('monto', e.target.value)} />
                <Input label="Materiales" value={form.materiales || ''} onChange={e => set('materiales', e.target.value)} placeholder="RAM, pantalla..." />
              </Row>
              <Input label="Validez (días)" type="number" value={form.validez_dias || 7} onChange={e => set('validez_dias', parseInt(e.target.value))} />
            </>
          ) : (
            <Select label="Estado" value={form.estado || ''} onChange={e => set('estado', e.target.value)}>
              {ESTADOS.map(s => <option key={s}>{s}</option>)}
            </Select>
          )}
          {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="ghost" onClick={cerrar}>Cancelar</Btn>
            <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ActionBtn({ children, ...props }) {
  return (
    <button style={{ background: 'none', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}
      onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
      {...props}>{children}</button>
  )
}
