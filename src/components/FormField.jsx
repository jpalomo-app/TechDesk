const s = {
  group: { marginBottom: 14 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none', transition: 'border 0.15s' },
  textarea: { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border 0.15s' },
  select: { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none' },
}

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
      <input style={s.input}
        onFocus={e => e.target.style.borderColor = '#f59e0b'}
        onBlur={e => e.target.style.borderColor = '#334155'}
        {...props} />
    </FormField>
  )
}

export function Textarea({ label, rows = 3, ...props }) {
  return (
    <FormField label={label}>
      <textarea style={{ ...s.textarea, minHeight: rows * 26 }}
        onFocus={e => e.target.style.borderColor = '#f59e0b'}
        onBlur={e => e.target.style.borderColor = '#334155'}
        {...props} />
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
  const base = { padding: '9px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' }
  const variants = {
    primary: { background: '#f59e0b', color: '#0f172a' },
    secondary: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' },
    danger: { background: '#ef4444', color: '#fff' },
    ghost: { background: 'transparent', color: '#64748b', border: '1px solid #334155' },
  }
  return (
    <button style={{ ...base, ...variants[variant], ...extra }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      {...props}>{children}</button>
  )
}
