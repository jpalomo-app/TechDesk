import { useState } from 'react'
import { loginUsuario } from '../supabase.js'

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usuario || !pass) { setError('Completá usuario y contraseña'); return }
    setLoading(true); setError('')
    try {
      const u = await loginUsuario(usuario, pass)
      onLogin(u)
    } catch (err) {
      setError(err.message || 'Error de acceso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}>JM</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>JM <span style={{ color: '#f59e0b' }}>INFORMÁTICA</span></div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>TechDesk — Sistema de gestión</div>
        </div>

        {/* Card */}
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 28, border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Usuario</label>
              <input value={usuario} onChange={e => setUsuario(e.target.value)}
                placeholder="admin" autoFocus
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor='#f59e0b'}
                onBlur={e => e.target.style.borderColor='#334155'} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contraseña</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor='#f59e0b'}
                onBlur={e => e.target.style.borderColor='#334155'} />
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '8px 12px', color: '#f87171', fontSize: 12, marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? '#92400e' : '#f59e0b', color: '#0f172a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', transition: 'background 0.15s' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#334155' }}>TechDesk v2.0 — JM Informática</div>
      </div>
    </div>
  )
}
