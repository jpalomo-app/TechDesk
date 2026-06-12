import { useState, useEffect } from 'react'
import { getOrdenes, getClientes, crearOrden, editarOrden, eliminarOrden, addHistorial } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Textarea, Select, Row, Btn } from '../components/FormField.jsx'
import { imprimirPDF } from '../utils/pdf.js'
import { enviarWhatsApp } from '../utils/whatsapp.js'

const T = { bg:'#09091e', surface:'#0e0c24', border:'#252348', border2:'#3a3870', text:'#f1f5f9', text2:'#a0a0c8', text3:'#4e4b80' }

const ESTADOS = ['Pendiente', 'En proceso', 'Finalizada', 'Pendiente de pago']

const estadoStyle = {
  Pendiente:            { background: 'rgba(234,179,8,0.12)',  color: '#eab308', border: 'rgba(234,179,8,0.3)' },
  'En proceso':         { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  Finalizada:           { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.3)' },
  'Pendiente de pago':  { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
}

function Badge({ estado }) {
  const s = estadoStyle[estado] || { background: 'rgba(160,160,200,0.1)', color: T.text2, border: 'rgba(160,160,200,0.3)' }
  return <span style={{ display:'inline-block', padding:'3px 11px', borderRadius:20, fontSize:10, fontWeight:700, background:s.background, color:s.color, border:`1px solid ${s.border}` }}>{estado}</span>
}

function ActionBtn({ children, ...props }) {
  return (
    <button style={{ background:'rgba(124,58,237,0.06)', border:`1px solid ${T.border}`, borderRadius:7, padding:'5px 9px', cursor:'pointer', fontSize:13, transition:'all 0.15s', color:T.text2 }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.18)'; e.currentTarget.style.borderColor=T.border2 }}
      onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor=T.border }}
      {...props}>{children}</button>
  )
}

const inputStyle = { flex:1, minWidth:200, padding:'9px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9, color:T.text, fontSize:13, outline:'none', transition:'border-color 0.15s, box-shadow 0.15s' }
const selectStyle = { padding:'9px 12px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9, color:T.text2, fontSize:13, outline:'none' }

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
      await cargar(); cerrar()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return
    await eliminarOrden(id)
    await addHistorial('BORRADO', 'ordenes', id, 'estado', '', 'Eliminado', usuario?.nombre)
    await cargar(); cerrar()
  }

  const verPDF   = (orden, idx) => imprimirPDF(orden, ordenes.length - idx)
  const enviarWA = async (orden) => {
    setWaLoading(true)
    try {
      await enviarWhatsApp({ telefono: orden.telefono, nombre: orden.cliente_nombre, fecha: orden.fecha, pdfUrl: orden.pdf_url || '' })
      alert('✅ WhatsApp enviado')
    } catch (e) { alert('❌ ' + (e.message || 'Error enviando WhatsApp')) }
    finally { setWaLoading(false) }
  }

  const filtradas = ordenes.filter(o => {
    const txt = `${o.cliente_nombre} ${o.tarea_realizada} ${o.descripcion}`.toLowerCase()
    return txt.includes(buscar.toLowerCase()) && (!filtroEst || o.estado === filtroEst)
  })

  const thStyle = { padding:'12px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }

  return (
    <div>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:20, flexWrap:'wrap' }}>
        <input value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="🔍  Buscar cliente, tarea..."
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor='#7c3aed'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.12)' }}
          onBlur={e => { e.target.style.borderColor=T.border; e.target.style.boxShadow='none' }} />
        <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
        <Btn onClick={abrirCrear}>+ Nueva orden</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:T.text3, padding:60 }}>Cargando...</div>
      ) : (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}`, background:'rgba(124,58,237,0.04)' }}>
                {['#','Fecha','Cliente','Servicio','Costo','Estado','Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:T.text3 }}>No hay órdenes</td></tr>
              ) : filtradas.map((o, i) => (
                <tr key={o.id} style={{ borderBottom:`1px solid rgba(37,35,72,0.6)` }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'11px 14px', color:T.text3, fontSize:11, fontFamily:'monospace' }}>#{String(ordenes.length - i).padStart(4,'0')}</td>
                  <td style={{ padding:'11px 14px', color:T.text3, fontSize:11, whiteSpace:'nowrap' }}>
                    {new Date(o.fecha).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'2-digit' })}
                  </td>
                  <td style={{ padding:'11px 14px', fontWeight:700, color:T.text, fontSize:13 }}>{o.cliente_nombre || '—'}</td>
                  <td style={{ padding:'11px 14px', color:T.text2, fontSize:12, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {o.tarea_realizada || o.descripcion || '—'}
                  </td>
                  <td style={{ padding:'11px 14px', color:'#fbbf24', fontWeight:800, fontSize:13, whiteSpace:'nowrap' }}>
                    $ {(parseFloat(o.costos)||0).toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding:'11px 14px' }}><Badge estado={o.estado} /></td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', gap:5 }}>
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

      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nueva orden de servicio' : 'Editar orden'} onClose={cerrar} width={620}>
          <Row>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.text2, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.07em' }}>Cliente</label>
              <select value={form.cliente_id || ''} onChange={e => seleccionarCliente(e.target.value)}
                style={{ width:'100%', padding:'10px 13px', background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13, outline:'none', boxSizing:'border-box' }}>
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
          {error && <div style={{ color:'#f87171', fontSize:12, marginBottom:12, padding:'8px 12px', background:'rgba(239,68,68,0.08)', borderRadius:7 }}>⚠ {error}</div>}
          <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:4 }}>
            <div>{modal.modo === 'editar' && <Btn variant="danger" onClick={() => eliminar(modal.orden.id)}>Eliminar</Btn>}</div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn variant="ghost" onClick={cerrar}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
