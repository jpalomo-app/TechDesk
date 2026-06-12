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

  const focusOn  = e => { e.target.style.borderColor='#7c3aed'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.18)' }
  const focusOff = e => { e.target.style.borderColor='#252348'; e.target.style.boxShadow='none' }

  return (
    <div style={{ minHeight: '100vh', background: '#09091e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Glow blob background */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(109,40,217,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 390, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg, #6d28d9, #a855f7)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 auto 14px', boxShadow: '0 8px 28px rgba(109,40,217,0.55)' }}>JM</div>
          <div style={{ fontSize: 23, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>JM <span style={{ color: '#a855f7' }}>INFORMÁTICA</span></div>
          <div style={{ fontSize: 12, color: '#4e4b80', marginTop: 5 }}>TechDesk — Sistema de gestión</div>
        </div>

        {/* Card */}
        <div style={{ background: '#0e0c24', borderRadius: 18, padding: '30px 28px', border: '1px solid #2d2b56', boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 22, letterSpacing: '-0.3px' }}>Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#a0a0c8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Usuario</label>
              <input value={usuario} onChange={e => setUsuario(e.target.value)}
                placeholder="admin" autoFocus
                style={{ width: '100%', padding: '11px 14px', background: '#09091e', border: '1px solid #252348', borderRadius: 9, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={focusOn} onBlur={focusOff} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#a0a0c8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Contraseña</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', background: '#09091e', border: '1px solid #252348', borderRadius: 9, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={focusOn} onBlur={focusOff} />
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '9px 13px', color: '#f87171', fontSize: 12, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#3b1f6e' : 'linear-gradient(135deg, #6d28d9, #a855f7)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', transition: 'all 0.18s', boxShadow: loading ? 'none' : '0 6px 20px rgba(109,40,217,0.5)', letterSpacing: '0.02em' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#252348' }}>TechDesk v2.0 — JM Informática</div>
      </div>
    </div>
  )
}
