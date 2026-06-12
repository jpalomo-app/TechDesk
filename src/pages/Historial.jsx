import { useState, useEffect } from 'react'
import { getHistorial } from '../supabase.js'

const tipoStyle = {
  CREADO: { color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  EDITADO: { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  BORRADO: { color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  CONVERTIDO: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  WHATSAPP: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
}

export default function Historial() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistorial().then(d => { setHistorial(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Cargando...</div>

  return (
    <div>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              {['Fecha', 'Usuario', 'Tipo', 'Tabla', 'Campo', 'Anterior', 'Nuevo'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Sin historial</td></tr>
            ) : historial.map(h => {
              const ts = tipoStyle[h.tipo] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
              return (
                <tr key={h.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(h.fecha).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12 }}>{h.usuario_nombre || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: ts.bg, color: ts.color }}>{h.tipo}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11 }}>{h.tabla}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 11 }}>{h.campo}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.valor_anterior || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#e2e8f0', fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.valor_nuevo || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
