import { useState, useEffect } from 'react'
import { getUsuarios, crearUsuario, editarUsuario } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Select, Row, Btn } from '../components/FormField.jsx'

const ROLES = ['admin', 'tecnico']

export default function Usuarios({ usuario: usuarioActual }) {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargar = () => getUsuarios().then(d => { setUsuarios(d); setLoading(false) })
  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm({ rol: 'tecnico', activo: true }); setError(''); setModal({ modo: 'crear' }) }
  const abrirEditar = (u) => { setForm({ ...u, pass: '' }); setError(''); setModal({ modo: 'editar', usr: u }) }
  const cerrar = () => setModal(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (modal.modo === 'crear' && (!form.usuario || !form.pass || !form.nombre)) { setError('Nombre, usuario y contraseña son obligatorios'); return }
    setSaving(true); setError('')
    try {
      if (modal.modo === 'crear') await crearUsuario(form)
      else await editarUsuario(modal.usr.id, form)
      await cargar(); cerrar()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Btn onClick={abrirCrear}>+ Nuevo usuario</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Iniciales', 'Nombre', 'Usuario', 'Rol', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                      {u.iniciales || '??'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{u.nombre}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>{u.usuario}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: u.rol === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: u.rol === 'admin' ? '#f59e0b' : '#60a5fa' }}>{u.rol}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: u.activo ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: u.activo ? '#34d399' : '#f87171' }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => abrirEditar(u)}
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

      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nuevo usuario' : 'Editar usuario'} onClose={cerrar}>
          <Row>
            <Input label="Nombre completo *" value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} placeholder="Juan García" />
            <Input label="Iniciales" value={form.iniciales || ''} onChange={e => set('iniciales', e.target.value)} placeholder="JG" />
          </Row>
          <Row>
            <Input label="Usuario *" value={form.usuario || ''} onChange={e => set('usuario', e.target.value)} placeholder="jgarcia" disabled={modal.modo === 'editar'} />
            <Input label={modal.modo === 'crear' ? 'Contraseña *' : 'Nueva contraseña (vacío = no cambiar)'} type="password" value={form.pass || ''} onChange={e => set('pass', e.target.value)} />
          </Row>
          <Row>
            <Select label="Rol" value={form.rol || 'tecnico'} onChange={e => set('rol', e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </Select>
            {modal.modo === 'editar' && (
              <Select label="Estado" value={form.activo ? 'activo' : 'inactivo'} onChange={e => set('activo', e.target.value === 'activo')}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Select>
            )}
          </Row>
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
