import { useState, useEffect } from 'react'
import { getReporteMensual } from '../supabase.js'

const T = { bg:'#09091e', surface:'#0e0c24', border:'#252348', border2:'#3a3870', text:'#f1f5f9', text2:'#a0a0c8', text3:'#4e4b80' }
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const ESTADO_COLOR = {
  Finalizada:           { bg:'rgba(52,211,153,0.12)',  color:'#34d399' },
  'En proceso':         { bg:'rgba(96,165,250,0.12)',  color:'#60a5fa' },
  Pendiente:            { bg:'rgba(168,85,247,0.12)',  color:'#a78bfa' },
  'Pendiente de pago':  { bg:'rgba(251,191,36,0.12)',  color:'#fbbf24' },
}

const fmt = (n) => new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(n)

function pct(actual, anterior) {
  if (!anterior) return actual > 0 ? '+100%' : '—'
  const diff = ((actual - anterior) / anterior) * 100
  return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%'
}

function imprimirReporte(data, mes, anio) {
  const { ordenes, totalActual, totalAnterior, porEstado } = data
  const fmtR = (n) => new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(n)
  const fmtF = (f) => new Date(f).toLocaleDateString('es-AR')
  const filas = ordenes.map(o => `
    <tr>
      <td>${fmtF(o.fecha)}</td><td>${o.cliente_nombre||'—'}</td><td>${o.tarea_realizada||'—'}</td>
      <td>${o.materiales_usados||'—'}</td><td style="text-align:center">${o.duracion_horas??'—'}</td>
      <td style="text-align:right;font-weight:600">${fmtR(parseFloat(o.costos)||0)}</td>
      <td style="text-align:center"><span style="padding:2px 8px;border-radius:4px;font-size:11px;background:${o.estado==='Finalizada'?'#d1fae5':'#fef3c7'};color:${o.estado==='Finalizada'?'#065f46':'#92400e'}">${o.estado}</span></td>
    </tr>`).join('')
  const estadoRows = Object.entries(porEstado).map(([e,n]) => `<span style="margin-right:16px"><strong>${n}</strong> ${e}</span>`).join('')
  const win = window.open('','_blank')
  win.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"><title>Reporte ${MESES[mes-1]} ${anio} – JM Informática</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box} body{font-family:Arial,sans-serif;color:#1e293b;padding:32px;font-size:13px}
      h1{font-size:22px;color:#0f172a;margin-bottom:4px} .sub{color:#64748b;font-size:12px;margin-bottom:24px}
      .cards{display:flex;gap:16px;margin-bottom:24px} .card{border:1px solid #e2e8f0;border-radius:8px;padding:16px;flex:1}
      .card-label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px}
      .card-val{font-size:22px;font-weight:700;color:#0f172a} .card-sub{font-size:11px;color:#94a3b8;margin-top:4px}
      .estados{margin-bottom:20px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;color:#374151;font-size:12px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;border-bottom:1px solid #e2e8f0}
      td{padding:8px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top} tr:last-child td{border-bottom:none}
      tfoot td{font-weight:700;border-top:2px solid #e2e8f0;padding-top:10px}
      .footer{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8}
      @media print{body{padding:16px} button{display:none}}
    </style></head><body>
    <h1>Reporte Mensual – ${MESES[mes-1]} ${anio}</h1>
    <div class="sub">JM Informática · Generado el ${new Date().toLocaleDateString('es-AR')}</div>
    <div class="cards">
      <div class="card"><div class="card-label">Total facturado</div><div class="card-val">${fmtR(totalActual)}</div><div class="card-sub">Mes anterior: ${fmtR(totalAnterior)}</div></div>
      <div class="card"><div class="card-label">Órdenes del mes</div><div class="card-val">${ordenes.length}</div><div class="card-sub">Mes anterior: ${data.cantAnterior}</div></div>
      <div class="card"><div class="card-label">Horas trabajadas</div><div class="card-val">${ordenes.reduce((s,o)=>s+(parseFloat(o.duracion_horas)||0),0)}</div><div class="card-sub">Total horas</div></div>
    </div>
    <div class="estados"><strong>Por estado:</strong> &nbsp; ${estadoRows}</div>
    <table><thead><tr>
      <th>Fecha</th><th>Cliente</th><th>Tarea</th><th>Materiales</th>
      <th style="text-align:center">Hs</th><th style="text-align:right">Importe</th><th style="text-align:center">Estado</th>
    </tr></thead><tbody>${filas}</tbody>
    <tfoot><tr><td colspan="5">TOTAL</td><td style="text-align:right">${fmtR(totalActual)}</td><td></td></tr></tfoot></table>
    <div class="footer">JM Informática – Sistema TechDesk</div>
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`)
  win.document.close()
}

const selStyle = { background:T.surface, border:`1px solid ${T.border}`, borderRadius:9, color:T.text, padding:'9px 13px', fontSize:13, outline:'none' }
const cardStyle = { background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:20, boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }
const thStyle = { padding:'11px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em' }

export default function Reportes() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth()+1)
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    try { const r = await getReporteMensual(anio, mes); setData(r) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { cargar() }, [mes, anio])

  const anios = []
  for (let y = hoy.getFullYear(); y >= hoy.getFullYear()-3; y--) anios.push(y)

  const varIngresos = data ? pct(data.totalActual, data.totalAnterior) : '—'
  const varOrdenes  = data ? pct(data.ordenes.length, data.cantAnterior) : '—'
  const esPos = (v) => v.startsWith('+')
  const canPrint = !loading && data && data.ordenes.length > 0

  return (
    <div>
      {/* Selector mes/año + botón PDF */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
        <select value={mes} onChange={e => setMes(Number(e.target.value))} style={selStyle}>
          {MESES.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={anio} onChange={e => setAnio(Number(e.target.value))} style={selStyle}>
          {anios.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => canPrint && imprimirReporte(data, mes, anio)}
          disabled={!canPrint}
          style={{ marginLeft:'auto', padding:'9px 20px', background:canPrint?'linear-gradient(135deg,#6d28d9,#a855f7)':'rgba(124,58,237,0.1)', border:`1px solid ${canPrint?'transparent':T.border}`, borderRadius:9, color:canPrint?'#fff':T.text3, fontSize:13, fontWeight:700, cursor:canPrint?'pointer':'not-allowed', transition:'all 0.18s', boxShadow:canPrint?'0 4px 14px rgba(109,40,217,0.4)':'none' }}>
          🖨️ Exportar PDF
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:T.text3, padding:80, fontSize:14 }}>Cargando...</div>
      ) : !data ? null : (
        <>
          {/* Cards resumen */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:20 }}>
            {[
              { label:'Total facturado',   value:fmt(data.totalActual), sub:`vs. ant. ${fmt(data.totalAnterior)}`, var:varIngresos, color:'#fbbf24', glow:'rgba(251,191,36,0.2)' },
              { label:'Órdenes del mes',   value:data.ordenes.length,   sub:`vs. ant. ${data.cantAnterior}`,         var:varOrdenes,  color:'#60a5fa', glow:'rgba(96,165,250,0.2)' },
              { label:'Horas trabajadas',  value:data.ordenes.reduce((s,o)=>s+(parseFloat(o.duracion_horas)||0),0), sub:'horas en el mes', var:null, color:'#a78bfa', glow:'rgba(167,139,250,0.2)' },
              { label:'Ticket promedio',   value:data.ordenes.length ? fmt(data.totalActual/data.ordenes.length) : '—', sub:'por orden del mes', var:null, color:'#34d399', glow:'rgba(52,211,153,0.2)' },
            ].map(c => (
              <div key={c.label} style={{ ...cardStyle, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-15, right:-15, width:80, height:80, background:`radial-gradient(circle,${c.glow} 0%,transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{c.label}</div>
                <div style={{ fontSize:26, fontWeight:900, color:c.color, letterSpacing:'-1px', lineHeight:1 }}>{c.value}</div>
                <div style={{ marginTop:8, fontSize:11, color:T.text3 }}>
                  {c.sub}
                  {c.var && c.var !== '—' && (
                    <span style={{ fontWeight:700, color:esPos(c.var)?'#34d399':'#f87171', marginLeft:6 }}>{c.var}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Por estado */}
          {Object.keys(data.porEstado).length > 0 && (
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
              {Object.entries(data.porEstado).map(([estado,cnt]) => {
                const col = ESTADO_COLOR[estado] || { bg:'rgba(78,75,128,0.12)', color:T.text2 }
                return (
                  <div key={estado} style={{ background:col.bg, border:`1px solid ${col.color}40`, borderRadius:10, padding:'10px 18px', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:22, fontWeight:900, color:col.color }}>{cnt}</span>
                    <span style={{ fontSize:12, color:col.color, fontWeight:600 }}>{estado}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tabla */}
          {data.ordenes.length === 0 ? (
            <div style={{ textAlign:'center', color:T.text3, padding:'60px 0', background:T.surface, borderRadius:14, border:`1px solid ${T.border}` }}>
              No hay órdenes en {MESES[mes-1]} {anio}
            </div>
          ) : (
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${T.border}`, background:'rgba(124,58,237,0.04)' }}>
                    {['Fecha','Cliente','Tarea realizada','Materiales','Hs','Importe','Estado'].map((h,i) => (
                      <th key={h} style={{ ...thStyle, textAlign: i>=4?'center':'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.ordenes.map(o => {
                    const col = ESTADO_COLOR[o.estado] || { bg:'rgba(78,75,128,0.12)', color:T.text2 }
                    return (
                      <tr key={o.id} style={{ borderBottom:`1px solid rgba(37,35,72,0.6)` }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'10px 14px', fontSize:12, color:T.text3, whiteSpace:'nowrap' }}>{new Date(o.fecha).toLocaleDateString('es-AR')}</td>
                        <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:T.text }}>{o.cliente_nombre||'—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:T.text2, maxWidth:260 }}>{o.tarea_realizada||'—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:11, color:T.text3, maxWidth:160 }}>{o.materiales_usados||'—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:13, color:T.text2, textAlign:'center' }}>{o.duracion_horas??'—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:14, fontWeight:800, color:'#fbbf24', textAlign:'center', whiteSpace:'nowrap' }}>{fmt(parseFloat(o.costos)||0)}</td>
                        <td style={{ padding:'10px 14px', textAlign:'center' }}>
                          <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:col.bg, color:col.color }}>{o.estado}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop:`2px solid ${T.border2}` }}>
                    <td colSpan={5} style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:T.text2, textAlign:'right' }}>TOTAL</td>
                    <td style={{ padding:'12px 14px', fontSize:16, fontWeight:900, color:'#fbbf24', textAlign:'center' }}>{fmt(data.totalActual)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
