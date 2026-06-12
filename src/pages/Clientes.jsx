import { useState, useEffect } from 'react'
import { getClientes, crearCliente, editarCliente } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Textarea, Select, Row, Btn } from '../components/FormField.jsx'

const T = { bg:'#09091e', surface:'#0e0c24', border:'#252348', border2:'#3a3870', text:'#f1f5f9', text2:'#a0a0c8', text3:'#4e4b80' }
const TIPOS = ['Cliente particular', 'Empresa', 'Empresa pequeña', 'Otro']

function badge(str) {
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:'rgba(124,58,237,0.12)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.25)' }}>{str}</span>
}

const inputStyle = { flex:1, maxWidth:360, padding:'9px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9, color:T.text, fontSize:13, outline:'none', transition:'border-color 0.15s, box-shadow 0.15s' }
const thStyle = { padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em' }

export default function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargar = () => getClientes().then(d => { setClientes(d); setLoading(false) })
  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm({}); setError(''); setModal({ modo: 'crear' }) }
  const abrirEditar = (c) => { setForm({ ...c }); setError(''); setModal({ modo: 'editar', cliente: c }) }
  const cerrar = () => setModal(null)

  const guardar = async () => {
    if (!form.nombre?.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true); setError('')
    try {
      if (modal.modo === 'crear') await crearCliente(form)
      else await editarCliente(modal.cliente.id, form)
      await cargar(); cerrar()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const filtrados = clientes.filter(c =>
    (c.nombre||'').toLowerCase().includes(buscar.toLowerCase()) ||
    (c.telefono||'').includes(buscar) ||
    (c.email||'').toLowerCase().includes(buscar.toLowerCase())
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <input value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="🔍  Buscar por nombre, teléfono o email..."
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor='#7c3aed'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.12)' }}
          onBlur={e => { e.target.style.borderColor=T.border; e.target.style.boxShadow='none' }} />
        <Btn onClick={abrirCrear} style={{ marginLeft:12 }}>+ Nuevo cliente</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:T.text3, padding:60 }}>Cargando...</div>
      ) : (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}`, background:'rgba(124,58,237,0.04)' }}>
                {['Nombre','Tipo','Teléfono','Email','Notas',''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:T.text3 }}>No hay clientes</td></tr>
              ) : filtrados.map(c => (
                <tr key={c.id} style={{ borderBottom:`1px solid rgba(37,35,72,0.6)` }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:T.text, fontSize:13 }}>{c.nombre}</td>
                  <td style={{ padding:'12px 16px' }}>{badge(c.tipo || 'Cliente particular')}</td>
                  <td style={{ padding:'12px 16px', color:T.text2, fontSize:13 }}>{c.telefono || '—'}</td>
                  <td style={{ padding:'12px 16px', color:T.text2, fontSize:13 }}>{c.email || '—'}</td>
                  <td style={{ padding:'12px 16px', color:T.text3, fontSize:12, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.notas || '—'}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={() => abrirEditar(c)}
                      style={{ background:'rgba(124,58,237,0.08)', border:`1px solid ${T.border}`, borderRadius:7, padding:'5px 14px', color:T.text2, fontSize:11, cursor:'pointer', fontWeight:600, transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.2)'; e.currentTarget.style.color=T.text }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.08)'; e.currentTarget.style.color=T.text2 }}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nuevo cliente' : 'Editar cliente'} onClose={cerrar}>
          <Row>
            <Input label="Nombre *" value={form.nombre||''} onChange={e => set('nombre', e.target.value)} placeholder="Juan García" />
            <Select label="Tipo" value={form.tipo||'Cliente particular'} onChange={e => set('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Row>
          <Row>
            <Input label="Teléfono" value={form.telefono||''} onChange={e => set('telefono', e.target.value)} placeholder="+54 221..." />
            <Input label="Email" type="email" value={form.email||''} onChange={e => set('email', e.target.value)} placeholder="cliente@mail.com" />
          </Row>
          <Input label="Dirección" value={form.direccion||''} onChange={e => set('direccion', e.target.value)} placeholder="Calle 123, La Plata" />
          <Textarea label="Notas" value={form.notas||''} onChange={e => set('notas', e.target.value)} placeholder="Información adicional..." />
          {error && <div style={{ color:'#f87171', fontSize:12, marginBottom:12, padding:'8px 12px', background:'rgba(239,68,68,0.08)', borderRadius:7 }}>⚠ {error}</div>}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="ghost" onClick={cerrar}>Cancelar</Btn>
            <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
