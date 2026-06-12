import { useState, useEffect } from 'react'
import { getStats } from '../supabase.js'

const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }

function StatCard({ icon, label, value, sub, color = '#f59e0b' }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-1px' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function EstadoBadge({ estado, count }) {
  const colors = {
    Pendiente: { bg: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'rgba(234,179,8,0.2)' },
    'En proceso': { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
    Finalizada: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.2)' },
    'Pendiente de pago': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  }
  const c = colors[estado] || { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{estado}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{count}</span>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#64748b' }}>Cargando...</div>
  )
  if (!stats) return null

  const maxCli = Math.max(...(stats.topClientes?.map(c => c.total) || [1]))

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="💰" label="Facturado este mes" value={`$ ${(stats.totalMes || 0).toLocaleString('es-AR')}`} color="#f59e0b" />
        <StatCard icon="🔧" label="Órdenes este mes" value={stats.tareasMes || 0} sub="trabajos realizados" color="#60a5fa" />
        <StatCard icon="📦" label="Total órdenes" value={stats.tareasTotal || 0} sub="historial completo" color="#34d399" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Por estado */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Estado de órdenes</div>
          {Object.entries(stats.porEstado || {}).map(([est, cnt]) => (
            <EstadoBadge key={est} estado={est} count={cnt} />
          ))}
        </div>

        {/* Top clientes */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Top clientes</div>
          {(stats.topClientes || []).map((c, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{c.nombre}</span>
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>$ {c.total.toLocaleString('es-AR')}</span>
              </div>
              <div style={{ height: 4, background: '#0f172a', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c.total / maxCli) * 100}%`, background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
          {!stats.topClientes?.length && <div style={{ color: '#475569', fontSize: 12 }}>Sin datos aún</div>}
        </div>

        {/* Evolución */}
        {stats.evolucion?.length > 0 && (
          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Evolución de facturación (últimos 6 meses)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
              {(() => {
                const maxVal = Math.max(...stats.evolucion.map(e => e.total), 1)
                return stats.evolucion.map((e, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>$ {(e.total/1000).toFixed(0)}k</div>
                    <div style={{ width: '100%', height: `${Math.max((e.total / maxVal) * 80, 4)}px`, background: i === stats.evolucion.length - 1 ? '#f59e0b' : '#1e3a5c', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                    <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>{e.mes}</div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
