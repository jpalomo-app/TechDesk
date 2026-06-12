export function generarPDFHTML(orden, nroOrden) {
  const fechaStr = orden.fecha
    ? new Date(orden.fecha).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : ''
  const costo = parseFloat(orden.costos) || 0
  const nro = String(nroOrden || '0000').padStart(4, '0')
  const materiales = orden.materiales_usados || ''

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;color:#1e293b;background:#fff;font-size:13px}
.header{background:#0f172a;padding:26px 36px;display:flex;justify-content:space-between;align-items:center}
.logo-wrap{display:flex;align-items:center;gap:14px}
.logo-badge{width:52px;height:52px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#0f172a}
.brand-name{font-size:22px;font-weight:800;color:#fff}
.brand-name em{color:#f59e0b;font-style:normal}
.brand-tag{font-size:10.5px;color:rgba(255,255,255,.45);margin-top:3px;font-style:italic}
.header-right{text-align:right}
.orden-eyebrow{font-size:9px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.12em}
.orden-num{font-size:26px;font-weight:800;color:#f59e0b;letter-spacing:-1px;line-height:1.1;margin-top:2px}
.orden-fecha{font-size:10px;color:rgba(255,255,255,.4);margin-top:4px}
.status-strip{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:9px 36px;display:flex;align-items:center;gap:8px}
.status-dot{width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0}
.status-label{font-size:11px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:.07em}
.status-id{margin-left:auto;font-size:10px;color:#94a3b8;font-family:monospace}
.body{padding:28px 36px}
.section{margin-bottom:22px}
.section-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.section-line{flex:1;height:1px;background:#e2e8f0}
.section-title{font-size:10px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;background:#f59e0b;color:#0f172a;padding:3px 10px;border-radius:20px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-card{background:#f8fafc;border:1px solid #e8edf2;border-radius:8px;padding:10px 14px}
.info-card-label{font-size:9.5px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px}
.info-card-value{font-size:13px;font-weight:600;color:#0f172a}
.diag-box{background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;border-radius:6px;padding:13px 16px;margin-bottom:10px}
.diag-label{font-size:9.5px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.diag-text{font-size:13px;color:#1e3a5f;line-height:1.65}
.tarea-box{background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:6px;padding:13px 16px}
.tarea-label{font-size:9.5px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.tarea-text{font-size:13px;color:#064e3b;line-height:1.65}
.mat-row{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
.mat-label{font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.06em;flex-shrink:0}
.mat-chips{display:flex;flex-wrap:wrap;gap:5px}
.mat-chip{background:#fff;border:1px solid #cbd5e1;border-radius:20px;padding:3px 10px;font-size:11px;color:#334155;font-weight:500}
.total-block{background:linear-gradient(135deg,#0f172a 0%,#1e3a5c 100%);border-radius:12px;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;margin:20px 0}
.total-lbl{font-size:12px;font-weight:600;color:rgba(255,255,255,.65)}
.total-val{font-size:30px;font-weight:800;color:#f59e0b;letter-spacing:-1px}
.garantia{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:18px}
.garantia-head{display:flex;align-items:center;gap:6px;margin-bottom:5px}
.garantia-title{font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.07em}
.garantia-txt{font-size:12px;color:#78350f;line-height:1.6}
.reco-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.reco-item{display:flex;align-items:flex-start;gap:7px;font-size:11.5px;color:#475569;line-height:1.55}
.reco-check{color:#10b981;font-weight:700;flex-shrink:0;margin-top:1px}
.firmas{display:flex;justify-content:space-around;margin:28px 0 6px}
.firma-box{text-align:center}
.firma-line{width:155px;border-top:1px solid #cbd5e1;padding-top:7px;margin:0 auto;font-size:10.5px;color:#94a3b8}
.footer{background:#0f172a;padding:12px 36px;display:flex;justify-content:space-between;align-items:center}
.footer-l{font-size:10px;color:rgba(255,255,255,.4)}
.footer-l strong{color:#f59e0b}
.footer-r{font-size:10px;color:rgba(255,255,255,.4);text-align:right}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head><body>
<div class="header">
  <div class="logo-wrap">
    <div class="logo-badge">JM</div>
    <div>
      <div class="brand-name">JM <em>INFORMÁTICA</em></div>
      <div class="brand-tag">Tecnología que te acompaña. Soluciones que te cuidan.</div>
    </div>
  </div>
  <div class="header-right">
    <div class="orden-eyebrow">Orden de Servicio</div>
    <div class="orden-num">#${nro}</div>
    <div class="orden-fecha">${fechaStr}</div>
  </div>
</div>
<div class="status-strip">
  <div class="status-dot"></div>
  <span class="status-label">${orden.estado || 'Finalizada'}</span>
  <span class="status-id">ID: ${orden.id}</span>
</div>
<div class="body">
  <div class="section">
    <div class="section-head"><span class="section-title">Datos del cliente</span><div class="section-line"></div></div>
    <div class="info-grid">
      <div class="info-card"><div class="info-card-label">Nombre</div><div class="info-card-value">${orden.cliente_nombre || '—'}</div></div>
      <div class="info-card"><div class="info-card-label">Teléfono / WhatsApp</div><div class="info-card-value">${orden.telefono || '—'}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-head"><span class="section-title">Diagnóstico y servicio</span><div class="section-line"></div></div>
    <div class="diag-box">
      <div class="diag-label">🔍 Diagnóstico</div>
      <div class="diag-text">${(orden.descripcion || 'Sin descripción de diagnóstico.').replace(/\n/g,'<br>')}</div>
    </div>
    <div class="tarea-box">
      <div class="tarea-label">🔧 Tarea realizada</div>
      <div class="tarea-text">${orden.tarea_realizada || '—'}</div>
    </div>
  </div>
  ${materiales && materiales !== '—' && materiales !== 'Ninguno' ? `
  <div class="section">
    <div class="section-head"><span class="section-title">Materiales utilizados</span><div class="section-line"></div></div>
    <div class="mat-row">
      <span class="mat-label">Insumos:</span>
      <div class="mat-chips">
        ${materiales.split(',').filter(m => m.trim()).map(m => `<span class="mat-chip">${m.trim()}</span>`).join('')}
      </div>
    </div>
  </div>` : ''}
  <div class="total-block">
    <span class="total-lbl">Total del servicio</span>
    <span class="total-val">$ ${costo.toLocaleString('es-AR')}</span>
  </div>
  <div class="garantia">
    <div class="garantia-head"><span>⚡</span><span class="garantia-title">Garantía del servicio — 30 días</span></div>
    <div class="garantia-txt">Ante cualquier inconveniente relacionado con el trabajo realizado, nos comprometemos a revisarlo sin costo adicional dentro de los 30 días posteriores al servicio.</div>
  </div>
  <div class="section">
    <div class="section-head"><span class="section-title">Recomendaciones</span><div class="section-line"></div></div>
    <div class="reco-grid">
      <div class="reco-item"><span class="reco-check">✓</span> Realizá copias de seguridad periódicas de tus archivos.</div>
      <div class="reco-item"><span class="reco-check">✓</span> Evitá los apagados bruscos del equipo.</div>
      <div class="reco-item"><span class="reco-check">✓</span> Mantené el sistema operativo actualizado.</div>
      <div class="reco-item"><span class="reco-check">✓</span> Usá un antivirus confiable y activo.</div>
    </div>
  </div>
  <div class="firmas">
    <div class="firma-box"><div class="firma-line">Firma del técnico</div></div>
    <div class="firma-box"><div class="firma-line">Conformidad del cliente</div></div>
  </div>
</div>
<div class="footer">
  <div class="footer-l"><strong>JM Informática</strong> · La Plata y alrededores</div>
  <div class="footer-r">WhatsApp: 2213542594 · Emitido el ${fechaStr}</div>
</div>
</body></html>`
}

export function imprimirPDF(orden, nroOrden) {
  const html = generarPDFHTML(orden, nroOrden)
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    setTimeout(() => {
      win.focus()
      win.print()
    }, 500)
  }
}
