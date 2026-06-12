import { useState, useEffect } from 'react'
import { getStats } from '../supabase.js'

const T = {
  bg:      '#09091e',
  surface: '#0e0c24',
  border:  '#252348',
  text:    '#f1f5f9',
  text2:   '#a0a0c8',
  text3:   '#4e4b80',
}

const card = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
}

function StatCard({ icon, label, value, sub, color = '#a855f7', glow = 'rgba(168,85,247,0.3)' }) {
  return (
    <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, background: `rgba(${color === '#a855f7' ? '168,85,247' : color === '#60a5fa' ? '96,165,250' : '52,211,153'}, 0.15)`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color, letterSpacing: '-1.5px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function EstadoBadge({ estado, count }) {
  const colors = {
    Pendiente:            { bg: 'rgba(234,179,8,0.1)',  color: '#eab308', border: 'rgba(234,179,8,0.2)' },
    'En proceso':         { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' },
    Finalizada:           { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
    'Pendiente de pago':  { bg: 'rgba(251,191,36,0.1)',color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  }
  const c = colors[estado] || { bg: 'rgba(160,160,200,0.1)', color: T.text2, border: 'rgba(160,160,200,0.2)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 9, marginBottom: 7 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{estado}</span>
      <span style={{ fontSize: 20, fontWeight: 900, color: c.color }}>{count}</span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats().then(s => { setStats(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: T.text3, gap: 10 }}>
      <div style={{ width: 16, height: 16, border: '2px solid #252348', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Cargando...
    </div>
  )
  if (!stats) return null

  const maxCli = Math.max(...(stats.topClientes?.map(c => c.total) || [1]))

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard icon="💰" label="Facturado este mes"
          value={`$ ${(stats.totalMes || 0).toLocaleString('es-AR')}`}
          color="#fbbf24" glow="rgba(251,191,36,0.25)" />
        <StatCard icon="🔧" label="Órdenes este mes"
          value={stats.tareasMes || 0} sub="trabajos realizados"
          color="#60a5fa" glow="rgba(96,165,250,0.25)" />
        <StatCard icon="📦" label="Total órdenes"
          value={stats.tareasTotal || 0} sub="historial completo"
          color="#34d399" glow="rgba(52,211,153,0.25)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Por estado */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Estado de órdenes</div>
          {Object.entries(stats.porEstado || {}).map(([est, cnt]) => (
            <EstadoBadge key={est} estado={est} count={cnt} />
          ))}
        </div>

        {/* Top clientes */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Top clientes</div>
          {(stats.topClientes || []).map((c, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{c.nombre}</span>
                <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 800 }}>$ {c.total.toLocaleString('es-AR')}</span>
              </div>
              <div style={{ height: 5, background: T.bg, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c.total / maxCli) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
          {!stats.topClientes?.length && <div style={{ color: T.text3, fontSize: 12 }}>Sin datos aún</div>}
        </div>

        {/* Evolución */}
        {stats.evolucion?.length > 0 && (
          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>Evolución de facturación — últimos 6 meses</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130 }}>
              {(() => {
                const maxVal = Math.max(...stats.evolucion.map(e => e.total), 1)
                return stats.evolucion.map((e, i) => {
                  const isLast = i === stats.evolucion.length - 1
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 10, color: isLast ? '#a855f7' : T.text3, fontWeight: isLast ? 700 : 400 }}>
                        $ {(e.total/1000).toFixed(0)}k
                      </div>
                      <div style={{
                        width: '100%',
                        height: `${Math.max((e.total / maxVal) * 100, 4)}px`,
                        background: isLast ? 'linear-gradient(180deg, #6d28d9, #a855f7)' : 'rgba(124,58,237,0.2)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                        boxShadow: isLast ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
                      }} />
                      <div style={{ fontSize: 10, color: isLast ? T.text2 : T.text3, whiteSpace: 'nowrap' }}>{e.mes}</div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
