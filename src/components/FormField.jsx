const T = {
  bg:       '#09091e',
  surface:  '#0e0c24',
  surface2: '#161434',
  border:   '#252348',
  border2:  '#3a3870',
  accent:   '#7c3aed',
  accent2:  '#a855f7',
  text:     '#f1f5f9',
  text2:    '#a0a0c8',
  text3:    '#4e4b80',
}

const s = {
  group:    { marginBottom: 14 },
  label:    { display: 'block', fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' },
  input:    { width: '100%', padding: '10px 13px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 13px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' },
  select:   { width: '100%', padding: '10px 13px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
}

const focusOn  = e => { e.target.style.borderColor = T.accent;  e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }
const focusOff = e => { e.target.style.borderColor = T.border;  e.target.style.boxShadow = 'none' }

export function FormField({ label, children }) {
  return (
    <div style={s.group}>
      {label && <label style={s.label}>{label}</label>}
      {children}
    </div>
  )
}

export function Input({ label, ...props }) {
  return (
    <FormField label={label}>
      <input style={s.input} onFocus={focusOn} onBlur={focusOff} {...props} />
    </FormField>
  )
}

export function Textarea({ label, rows = 3, ...props }) {
  return (
    <FormField label={label}>
      <textarea style={{ ...s.textarea, minHeight: rows * 28 }} onFocus={focusOn} onBlur={focusOff} {...props} />
    </FormField>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <FormField label={label}>
      <select style={s.select} {...props}>{children}</select>
    </FormField>
  )
}

export function Row({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  )
}

export function Btn({ children, variant = 'primary', style: extra, ...props }) {
  const base = {
    padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'all 0.18s', letterSpacing: '0.01em',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  }
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #6d28d9, #a855f7)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
    },
    secondary: {
      background: T.surface2,
      color: T.text2,
      border: `1px solid ${T.border}`,
      boxShadow: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
    },
    ghost: {
      background: 'transparent',
      color: T.text2,
      border: `1px solid ${T.border}`,
      boxShadow: 'none',
    },
  }
  const hoverMap = {
    primary:   { filter: 'brightness(1.1)', transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(124,58,237,0.55)' },
    secondary: { borderColor: T.border2, color: T.text },
    danger:    { filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
    ghost:     { borderColor: T.border2, color: T.text, background: 'rgba(124,58,237,0.06)' },
  }
  const v = variants[variant] || variants.primary
  const hv = hoverMap[variant] || hoverMap.primary
  return (
    <button
      style={{ ...base, ...v, ...extra }}
      onMouseEnter={e => Object.assign(e.currentTarget.style, hv)}
      onMouseLeave={e => Object.assign(e.currentTarget.style, v)}
      {...props}>
      {children}
    </button>
  )
}
