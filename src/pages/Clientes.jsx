import { useState, useEffect } from 'react'
import { getClientes, crearCliente, editarCliente } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Textarea, Select, Row, Btn } from '../components/FormField.jsx'

const TIPOS = ['Cliente particular', 'Empresa', 'Empresa pequeña', 'Otro']

function badge(str) {
  const s = { display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }
  return <span style={s}>{str}</span>
}

export default function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [modal, setModal] = useState(null) // null | {modo:'crear'} | {modo:'editar', cliente}
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
      await cargar()
      cerrar()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const filtrados = clientes.filter(c =>
    (c.nombre || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (c.telefono || '').includes(buscar) ||
    (c.email || '').toLowerCase().includes(buscar.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <input value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="🔍  Buscar por nombre, teléfono o email..."
          style={{ flex: 1, maxWidth: 360, padding: '9px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
        <Btn onClick={abrirCrear} style={{ marginLeft: 12 }}>+ Nuevo cliente</Btn>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Nombre', 'Tipo', 'Teléfono', 'Email', 'Notas', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No hay clientes</td></tr>
              ) : filtrados.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{c.nombre}</td>
                  <td style={{ padding: '12px 16px' }}>{badge(c.tipo || 'Cliente particular')}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>{c.telefono || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>{c.email || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notas || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => abrirEditar(c)}
                      style={{ background: 'none', border: '1px solid #334155', borderRadius: 6, padding: '5px 12px', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nuevo cliente' : 'Editar cliente'} onClose={cerrar}>
          <Row>
            <Input label="Nombre *" value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} placeholder="Juan García" />
            <Select label="Tipo" value={form.tipo || 'Cliente particular'} onChange={e => set('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Row>
          <Row>
            <Input label="Teléfono" value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="+54 221..." />
            <Input label="Email" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="cliente@mail.com" />
          </Row>
          <Input label="Dirección" value={form.direccion || ''} onChange={e => set('direccion', e.target.value)} placeholder="Calle 123, La Plata" />
          <Textarea label="Notas" value={form.notas || ''} onChange={e => set('notas', e.target.value)} placeholder="Información adicional..." />
          {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={cerrar}>Cancelar</Btn>
            <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
