export default function Modal({ title, children, onClose, width = 560 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(5,4,20,0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#0e0c24',
        borderRadius: 16,
        width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #2d2b56',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid #252348',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'rgba(124,58,237,0.08)', border: '1px solid #252348',
            borderRadius: 7, color: '#a0a0c8', fontSize: 16, cursor: 'pointer',
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#f1f5f9' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.color = '#a0a0c8' }}>
            ×
          </button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  )
}
