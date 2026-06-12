const WA_KEY = 'uGy6ovvmpWvx'

export async function enviarWhatsApp({ telefono, nombre, fecha, pdfUrl }) {
  let tel = String(telefono || '').trim().replace(/\s/g, '')
  if (!tel) throw new Error('Sin teléfono')
  if (!tel.startsWith('+')) tel = '+' + tel

  const fechaStr = fecha
    ? new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-AR')

  const msg = `Hola ${nombre || 'cliente'}! Te comparto el informe técnico del trabajo que realizamos el ${fechaStr}. Gracias por confiar en JM Informática, cualquier cosa estoy a disposición.\n\n${pdfUrl || ''}`

  const url = `http://api.textmebot.com/send.php?recipient=${encodeURIComponent(tel)}&apikey=${WA_KEY}&text=${encodeURIComponent(msg)}&json=yes`

  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Error enviando WhatsApp')
  return await resp.text()
}
