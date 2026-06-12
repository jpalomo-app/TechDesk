import { useState, useEffect } from 'react'
import { getOrdenes, getClientes, crearOrden, editarOrden, eliminarOrden, addHistorial } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Textarea, Select, Row, Btn } from '../components/FormField.jsx'
import { imprimirPDF } from '../utils/pdf.js'
import { enviarWhatsApp } from '../utils/whatsapp.js'

const ESTADOS = ['Pendiente', 'En proceso', 'Finalizada', 'Pendiente de pago']

const estadoStyle = {
  Pendiente: { background: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'rgba(234,179,8,0.3)' },
  'En proceso': { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  Finalizada: { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'Pendiente de pago': { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
}

function Badge({ estado }) {
  const s = estadoStyle[estado] || { background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.background, color: s.color, border: `1px solid ${s.border}` }}>{estado}</span>
}

export default function Ordenes({ usuario }) {
  const [ordenes, setOrdenes] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroEst, setFiltroEst] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [waLoading, setWaLoading] = useState(false)

  const cargar = async () => {
    const [o, c] = await Promise.all([getOrdenes(), getClientes()])
    setOrdenes(o); setClientes(c); setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm({ estado: 'Pendiente' }); setError(''); setModal({ modo: 'crear' }) }
  const abrirEditar = (o) => { setForm({ ...o }); setError(''); setModal({ modo: 'editar', orden: o }) }
  const cerrar = () => setModal(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const seleccionarCliente = (id) => {
    const c = clientes.find(c => c.id === id)
    set('cliente_id', id)
    if (c) { set('cliente_nombre', c.nombre); set('cliente_tipo', c.tipo); set('telefono', c.telefono || '') }
  }

  const guardar = async () => {
    if (!form.descripcion?.trim() && !form.tarea_realizada?.trim()) { setError('Completá al menos la descripción o la tarea realizada'); return }
    setSaving(true); setError('')
    try {
      if (modal.modo === 'crear') {
        await crearOrden(form)
        await addHistorial('CREADO', 'ordenes', '', 'Registro', '', form.tarea_realizada, usuario?.nombre)
      } else {
        await editarOrden(modal.orden.id, form)
        await addHistorial('EDITADO', 'ordenes', modal.orden.id, 'estado', modal.orden.estado, form.estado, usuario?.nombre)
      }
      await cargar()
      cerrar()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return
    await eliminarOrden(id)
    await addHistorial('BORRADO', 'ordenes', id, 'estado', '', 'Eliminado', usuario?.nombre)
    await cargar()
    cerrar()
  }

  const verPDF = (orden, idx) => imprimirPDF(orden, ordenes.length - idx)

  const enviarWA = async (orden) => {
    setWaLoading(true)
    try {
      await enviarWhatsApp({ telefono: orden.telefono, nombre: orden.cliente_nombre, fecha: orden.fecha, pdfUrl: orden.pdf_url || '' })
      alert('✅ WhatsApp enviado')
    } catch (e) {
      alert('❌ ' + (e.message || 'Error enviando WhatsApp'))
    } finally { setWaLoading(false) }
  }

  const filtradas = ordenes.filter(o => {
    const txt = `${o.cliente_nombre} ${o.tarea_realizada} ${o.descripcion}`.toLowerCase()
    return txt.includes(buscar.toLowerCase()) && (!filtroEst || o.estado === filtroEst)
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="🔍  Buscar cliente, tarea..."
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
        <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)}
          style={{ padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 13 }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
        <Btn onClick={abrirCrear}>+ Nueva orden</Btn>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['#', 'Fecha', 'Cliente', 'Servicio', 'Costo', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No hay órdenes</td></tr>
              ) : filtradas.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 14px', color: '#475569', fontSize: 11, fontFamily: 'monospace' }}>#{String(ordenes.length - i).padStart(4, '0')}</td>
                  <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(o.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{o.cliente_nombre || '—'}</td>
                  <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.tarea_realizada || o.descripcion || '—'}
                  </td>
                  <td style={{ padding: '11px 14px', color: '#f59e0b', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                    $ {(parseFloat(o.costos) || 0).toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding: '11px 14px' }}><Badge estado={o.estado} /></td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <ActionBtn onClick={() => abrirEditar(o)} title="Editar">✏️</ActionBtn>
                      <ActionBtn onClick={() => verPDF(o, i)} title="Ver PDF">📄</ActionBtn>
                      <ActionBtn onClick={() => enviarWA(o)} title="WhatsApp" disabled={waLoading || !o.telefono}>💬</ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nueva orden de servicio' : 'Editar orden'} onClose={cerrar} width={620}>
          <Row>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cliente</label>
              <select value={form.cliente_id || ''} onChange={e => seleccionarCliente(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none' }}>
                <option value="">-- Seleccionar --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <Select label="Estado" value={form.estado || 'Pendiente'} onChange={e => set('estado', e.target.value)}>
              {ESTADOS.map(s => <option key={s}>{s}</option>)}
            </Select>
          </Row>
          <Row>
            <Input label="Teléfono" value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="+54 221..." />
            <Input label="Costo ($)" type="number" value={form.costos || ''} onChange={e => set('costos', e.target.value)} placeholder="0" />
          </Row>
          <Textarea label="Descripción / Diagnóstico" rows={3} value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} placeholder="Problema reportado por el cliente..." />
          <Textarea label="Tarea realizada" rows={3} value={form.tarea_realizada || ''} onChange={e => set('tarea_realizada', e.target.value)} placeholder="Qué se hizo..." />
          <Row>
            <Input label="Materiales usados" value={form.materiales_usados || ''} onChange={e => set('materiales_usados', e.target.value)} placeholder="RAM 8GB, Pasta térmica..." />
            <Input label="Duración (hs)" type="number" value={form.duracion_horas || ''} onChange={e => set('duracion_horas', e.target.value)} placeholder="1.5" />
          </Row>
          {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
            <div>
              {modal.modo === 'editar' && <Btn variant="danger" onClick={() => eliminar(modal.orden.id)}>Eliminar</Btn>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="ghost" onClick={cerrar}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ActionBtn({ children, ...props }) {
  return (
    <button style={{ background: 'none', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13, transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
      {...props}>{children}</button>
  )
}
