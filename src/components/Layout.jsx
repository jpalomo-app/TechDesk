import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const s = {
  wrap: { display: 'flex', height: '100vh', background: '#0f172a', overflow: 'hidden' },
  sidebar: { width: 220, background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo: { padding: '24px 20px', borderBottom: '1px solid #1e293b' },
  badge: { width: 40, height: 40, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 8 },
  brand: { fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  brandEm: { color: '#f59e0b' },
  slogan: { fontSize: 10, color: '#475569', marginTop: 2 },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  navSection: { padding: '8px 16px 4px', fontSize: 9, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' },
  footer: { padding: 16, borderTop: '1px solid #1e293b' },
  userCard: { background: '#1e293b', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  userNom: { fontSize: 12, fontWeight: 600, color: '#e2e8f0' },
  userRol: { fontSize: 10, color: '#64748b', textTransform: 'capitalize' },
  logoutBtn: { width: '100%', padding: '8px 0', background: 'transparent', border: '1px solid #1e293b', borderRadius: 6, color: '#64748b', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { padding: '14px 24px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9' },
  content: { flex: 1, overflowY: 'auto', padding: 24, background: '#0f172a' },
}

const navLinkStyle = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '8px 16px', marginBottom: 2, borderRadius: 8, marginLeft: 8, marginRight: 8,
  fontSize: 13, fontWeight: isActive ? 600 : 400,
  color: isActive ? '#f59e0b' : '#94a3b8',
  background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
  textDecoration: 'none', transition: 'all 0.15s',
  borderLeft: isActive ? '2px solid #f59e0b' : '2px solid transparent',
})

const pages = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/ordenes',   icon: '🔧', label: 'Órdenes' },
  { to: '/presupuestos', icon: '📋', label: 'Presupuestos' },
  { to: '/clientes',  icon: '👥', label: 'Clientes' },
  { to: '/historial', icon: '📜', label: 'Historial' },
]

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/ordenes': 'Órdenes de Servicio',
  '/presupuestos': 'Presupuestos',
  '/clientes': 'Clientes',
  '/historial': 'Historial',
  '/usuarios': 'Usuarios',
}

export default function Layout({ usuario, onLogout }) {
  const loc = useLocation()
  const title = pageTitles[loc.pathname] || 'TechDesk'

  return (
    <div style={s.wrap}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.badge}>JM</div>
          <div style={s.brand}>JM <span style={s.brandEm}>INFORMÁTICA</span></div>
          <div style={s.slogan}>Servicio Técnico Profesional</div>
        </div>
        <nav style={s.nav}>
          <div style={s.navSection}>Principal</div>
          {pages.map(p => (
            <NavLink key={p.to} to={p.to} style={navLinkStyle}>
              <span>{p.icon}</span> {p.label}
            </NavLink>
          ))}
          {usuario.rol === 'admin' && (
            <>
              <div style={{ ...s.navSection, marginTop: 8 }}>Admin</div>
              <NavLink to="/usuarios" style={navLinkStyle}>
                <span>👤</span> Usuarios
              </NavLink>
            </>
          )}
        </nav>
        <div style={s.footer}>
          <div style={s.userCard}>
            <div style={s.userNom}>{usuario.nombre || usuario.usuario}</div>
            <div style={s.userRol}>{usuario.rol}</div>
          </div>
          <button style={s.logoutBtn} onClick={onLogout}
            onMouseEnter={e => { e.target.style.color='#f87171'; e.target.style.borderColor='#f87171' }}
            onMouseLeave={e => { e.target.style.color='#64748b'; e.target.style.borderColor='#1e293b' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div style={s.main}>
        <div style={s.topbar}>
          <span style={s.pageTitle}>{title}</span>
          <span style={{ fontSize: 11, color: '#475569' }}>{new Date().toLocaleDateString('es-AR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
        </div>
        <main style={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
