import { Outlet, NavLink, useLocation } from 'react-router-dom'

const T = {
  bg:       '#09091e',
  surface:  '#0e0c24',
  surface2: '#161434',
  border:   '#252348',
  accent:   '#7c3aed',
  accent2:  '#a855f7',
  text:     '#f1f5f9',
  text2:    '#a0a0c8',
  text3:    '#4e4b80',
}

const s = {
  wrap:      { display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' },
  sidebar:   { width: 228, background: 'linear-gradient(180deg, #0c0a22 0%, #09091e 100%)', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:      { padding: '24px 20px 20px', borderBottom: `1px solid ${T.border}` },
  badge:     { width: 42, height: 42, background: 'linear-gradient(135deg, #6d28d9, #a855f7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 10, boxShadow: '0 4px 14px rgba(124,58,237,0.5)' },
  brand:     { fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' },
  brandEm:   { color: T.accent2 },
  slogan:    { fontSize: 10, color: T.text3, marginTop: 3 },
  nav:       { flex: 1, padding: '14px 0 8px', overflowY: 'auto' },
  navSection:{ padding: '8px 18px 5px', fontSize: 9, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.12em' },
  footer:    { padding: 14, borderTop: `1px solid ${T.border}` },
  userCard:  { background: T.surface2, borderRadius: 10, padding: '10px 13px', marginBottom: 8, border: `1px solid ${T.border}` },
  userNom:   { fontSize: 12, fontWeight: 700, color: T.text },
  userRol:   { fontSize: 10, color: T.text3, textTransform: 'capitalize', marginTop: 1 },
  logoutBtn: { width: '100%', padding: '8px 0', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 7, color: T.text3, fontSize: 11, cursor: 'pointer', transition: 'all 0.18s', fontWeight: 600 },
  main:      { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar:    { padding: '14px 26px', background: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' },
  content:   { flex: 1, overflowY: 'auto', padding: 24, background: T.bg },
}

const navLinkStyle = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '9px 14px', marginBottom: 2, borderRadius: 9, marginLeft: 8, marginRight: 8,
  fontSize: 13, fontWeight: isActive ? 700 : 400,
  color: isActive ? '#fff' : T.text2,
  background: isActive ? 'linear-gradient(135deg, rgba(109,40,217,0.35), rgba(168,85,247,0.18))' : 'transparent',
  textDecoration: 'none', transition: 'all 0.15s',
  borderLeft: isActive ? '2px solid #a855f7' : '2px solid transparent',
  boxShadow: isActive ? 'inset 0 0 20px rgba(124,58,237,0.08)' : 'none',
})

const pages = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/ordenes',      icon: '🔧', label: 'Órdenes' },
  { to: '/presupuestos', icon: '📋', label: 'Presupuestos' },
  { to: '/clientes',     icon: '👥', label: 'Clientes' },
  { to: '/historial',    icon: '📜', label: 'Historial' },
  { to: '/reportes',     icon: '📈', label: 'Reportes' },
]

const pageTitles = {
  '/dashboard':    'Dashboard',
  '/ordenes':      'Órdenes de Servicio',
  '/presupuestos': 'Presupuestos',
  '/clientes':     'Clientes',
  '/historial':    'Historial',
  '/reportes':     'Reportes Mensuales',
  '/usuarios':     'Usuarios',
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
              <span style={{ fontSize: 15 }}>{p.icon}</span> {p.label}
            </NavLink>
          ))}
          {usuario.rol === 'admin' && (
            <>
              <div style={{ ...s.navSection, marginTop: 10 }}>Admin</div>
              <NavLink to="/usuarios" style={navLinkStyle}>
                <span style={{ fontSize: 15 }}>👤</span> Usuarios
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
            onMouseEnter={e => { e.target.style.color='#f87171'; e.target.style.borderColor='rgba(239,68,68,0.4)'; e.target.style.background='rgba(239,68,68,0.06)' }}
            onMouseLeave={e => { e.target.style.color='#4e4b80'; e.target.style.borderColor='#252348'; e.target.style.background='transparent' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, background: 'linear-gradient(180deg,#7c3aed,#a855f7)', borderRadius: 2 }} />
            <span style={s.pageTitle}>{title}</span>
          </div>
          <span style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <main style={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
