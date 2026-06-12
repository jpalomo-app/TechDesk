import { useState, useEffect } from 'react'
import { getHistorial } from '../supabase.js'

const T = { bg:'#09091e', surface:'#0e0c24', border:'#252348', text:'#f1f5f9', text2:'#a0a0c8', text3:'#4e4b80' }

const tipoStyle = {
  CREADO:    { color:'#34d399', bg:'rgba(52,211,153,0.12)' },
  EDITADO:   { color:'#60a5fa', bg:'rgba(96,165,250,0.12)' },
  BORRADO:   { color:'#f87171', bg:'rgba(239,68,68,0.12)' },
  CONVERTIDO:{ color:'#fbbf24', bg:'rgba(251,191,36,0.12)' },
  WHATSAPP:  { color:'#a78bfa', bg:'rgba(167,139,250,0.12)' },
}

const thStyle = { padding:'12px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em' }

export default function Historial() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistorial().then(d => { setHistorial(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{ textAlign:'center', color:T.text3, padding:60 }}>Cargando...</div>

  return (
    <div>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${T.border}`, background:'rgba(124,58,237,0.04)' }}>
              {['Fecha','Usuario','Tipo','Tabla','Campo','Anterior','Nuevo'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:T.text3 }}>Sin historial</td></tr>
            ) : historial.map(h => {
              const ts = tipoStyle[h.tipo] || { color:T.text2, bg:'rgba(160,160,200,0.1)' }
              return (
                <tr key={h.id} style={{ borderBottom:`1px solid rgba(37,35,72,0.6)` }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'10px 14px', color:T.text3, fontSize:11, whiteSpace:'nowrap' }}>
                    {new Date(h.fecha).toLocaleString('es-AR',{ day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td style={{ padding:'10px 14px', color:T.text2, fontSize:12 }}>{h.usuario_nombre||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ display:'inline-block', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:ts.bg, color:ts.color }}>{h.tipo}</span>
                  </td>
                  <td style={{ padding:'10px 14px', color:T.text3, fontSize:11 }}>{h.tabla}</td>
                  <td style={{ padding:'10px 14px', color:T.text2, fontSize:11 }}>{h.campo}</td>
                  <td style={{ padding:'10px 14px', color:T.text3, fontSize:11, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.valor_anterior||'—'}</td>
                  <td style={{ padding:'10px 14px', color:T.text, fontSize:11, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.valor_nuevo||'—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
