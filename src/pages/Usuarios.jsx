import { useState, useEffect } from 'react'
import { getUsuarios, crearUsuario, editarUsuario } from '../supabase.js'
import Modal from '../components/Modal.jsx'
import { Input, Select, Row, Btn } from '../components/FormField.jsx'

const T = { bg:'#09091e', surface:'#0e0c24', border:'#252348', border2:'#3a3870', text:'#f1f5f9', text2:'#a0a0c8', text3:'#4e4b80' }
const ROLES = ['admin','tecnico']
const thStyle = { padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em' }

export default function Usuarios({ usuario: usuarioActual }) {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargar = () => getUsuarios().then(d => { setUsuarios(d); setLoading(false) })
  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm({ rol:'tecnico', activo:true }); setError(''); setModal({ modo:'crear' }) }
  const abrirEditar = (u) => { setForm({ ...u, pass:'' }); setError(''); setModal({ modo:'editar', usr:u }) }
  const cerrar = () => setModal(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }))

  const guardar = async () => {
    if (modal.modo === 'crear' && (!form.usuario||!form.pass||!form.nombre)) { setError('Nombre, usuario y contraseña son obligatorios'); return }
    setSaving(true); setError('')
    try {
      if (modal.modo === 'crear') await crearUsuario(form)
      else await editarUsuario(modal.usr.id, form)
      await cargar(); cerrar()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
        <Btn onClick={abrirCrear}>+ Nuevo usuario</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:T.text3, padding:60 }}>Cargando...</div>
      ) : (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}`, background:'rgba(124,58,237,0.04)' }}>
                {['Iniciales','Nombre','Usuario','Rol','Estado',''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom:`1px solid rgba(37,35,72,0.6)` }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ width:34, height:34, background:'linear-gradient(135deg, #6d28d9, #a855f7)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'#fff', boxShadow:'0 3px 10px rgba(109,40,217,0.45)' }}>
                      {u.iniciales||'??'}
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:T.text, fontSize:13 }}>{u.nombre}</td>
                  <td style={{ padding:'12px 16px', color:T.text2, fontSize:12, fontFamily:'monospace' }}>{u.usuario}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700,
                      background: u.rol==='admin'?'rgba(168,85,247,0.15)':'rgba(96,165,250,0.12)',
                      color: u.rol==='admin'?'#a855f7':'#60a5fa',
                      border: u.rol==='admin'?'1px solid rgba(168,85,247,0.3)':'1px solid rgba(96,165,250,0.3)',
                    }}>{u.rol}</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700,
                      background: u.activo?'rgba(52,211,153,0.12)':'rgba(239,68,68,0.1)',
                      color: u.activo?'#34d399':'#f87171',
                      border: u.activo?'1px solid rgba(52,211,153,0.3)':'1px solid rgba(239,68,68,0.3)',
                    }}>
                      {u.activo?'Activo':'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={() => abrirEditar(u)}
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
        <Modal title={modal.modo==='crear'?'Nuevo usuario':'Editar usuario'} onClose={cerrar}>
          <Row>
            <Input label="Nombre completo *" value={form.nombre||''} onChange={e => set('nombre', e.target.value)} placeholder="Juan García" />
            <Input label="Iniciales" value={form.iniciales||''} onChange={e => set('iniciales', e.target.value)} placeholder="JG" />
          </Row>
          <Row>
            <Input label="Usuario *" value={form.usuario||''} onChange={e => set('usuario', e.target.value)} placeholder="jgarcia" disabled={modal.modo==='editar'} />
            <Input label={modal.modo==='crear'?'Contraseña *':'Nueva contraseña (vacío = no cambiar)'} type="password" value={form.pass||''} onChange={e => set('pass', e.target.value)} />
          </Row>
          <Row>
            <Select label="Rol" value={form.rol||'tecnico'} onChange={e => set('rol', e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </Select>
            {modal.modo==='editar' && (
              <Select label="Estado" value={form.activo?'activo':'inactivo'} onChange={e => set('activo', e.target.value==='activo')}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Select>
            )}
          </Row>
          {error && <div style={{ color:'#f87171', fontSize:12, marginBottom:12, padding:'8px 12px', background:'rgba(239,68,68,0.08)', borderRadius:7 }}>⚠ {error}</div>}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="ghost" onClick={cerrar}>Cancelar</Btn>
            <Btn onClick={guardar} disabled={saving}>{saving?'Guardando...':'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
