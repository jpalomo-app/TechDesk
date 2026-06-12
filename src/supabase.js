import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uhcocimybfgydaedixhl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoY29jaW15YmZneWRhZWRpeGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODA5OTIsImV4cCI6MjA5Njc1Njk5Mn0.0fcfzfW-2YYL8SsxhFSIYFZK9wmrq1owkt17dXa2n4M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Clientes ────────────────────────────────────────────────────
export async function getClientes() {
  const { data, error } = await supabase.from('clientes').select('*').order('fecha_alta', { ascending: false })
  if (error) throw error
  return data
}

export async function crearCliente(b) {
  const { data, error } = await supabase.from('clientes').insert([{
    nombre: b.nombre || '',
    tipo: b.tipo || 'Cliente particular',
    telefono: b.telefono || '',
    email: b.email || '',
    direccion: b.direccion || '',
    notas: b.notas || '',
  }]).select().single()
  if (error) throw error
  return data
}

export async function editarCliente(id, b) {
  const { error } = await supabase.from('clientes').update({
    nombre: b.nombre,
    tipo: b.tipo,
    telefono: b.telefono,
    email: b.email,
    direccion: b.direccion,
    notas: b.notas,
  }).eq('id', id)
  if (error) throw error
}

// ─── Órdenes ─────────────────────────────────────────────────────
export async function getOrdenes() {
  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .eq('activo', true)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data
}

export async function crearOrden(b) {
  const { data, error } = await supabase.from('ordenes').insert([{
    cliente_id: b.cliente_id || null,
    cliente_nombre: b.cliente_nombre || '',
    cliente_tipo: b.cliente_tipo || 'Cliente particular',
    tarea_realizada: b.tarea_realizada || '',
    materiales_usados: b.materiales_usados || '',
    descripcion: b.descripcion || '',
    duracion_horas: b.duracion_horas || null,
    costos: parseFloat(b.costos) || 0,
    telefono: b.telefono || '',
    estado: b.estado || 'Pendiente',
  }]).select().single()
  if (error) throw error
  return data
}

export async function editarOrden(id, b) {
  const updates = {}
  const fields = ['tarea_realizada','materiales_usados','descripcion','duracion_horas','costos','estado','pdf_url']
  fields.forEach(f => { if (b[f] !== undefined) updates[f] = b[f] })
  const { error } = await supabase.from('ordenes').update(updates).eq('id', id)
  if (error) throw error
}

export async function eliminarOrden(id) {
  const { error } = await supabase.from('ordenes').update({ activo: false, estado: 'Eliminado' }).eq('id', id)
  if (error) throw error
}

// ─── Presupuestos ─────────────────────────────────────────────────
export async function getPresupuestos() {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throw error
  return data
}

export async function crearPresupuesto(b) {
  const vence = b.fecha_vencimiento
    ? new Date(b.fecha_vencimiento)
    : new Date(Date.now() + (b.validez_dias || 7) * 86400000)
  const { data, error } = await supabase.from('presupuestos').insert([{
    cliente_id: b.cliente_id || null,
    cliente_nombre: b.cliente_nombre || '',
    telefono: b.telefono || '',
    descripcion: b.descripcion || '',
    detalle: b.detalle || '',
    monto: parseFloat(b.monto) || 0,
    materiales: b.materiales || '',
    estado: 'Pendiente de aprobación',
    fecha_vencimiento: vence.toISOString(),
    validez_dias: b.validez_dias || 7,
  }]).select().single()
  if (error) throw error
  return data
}

export async function editarPresupuesto(id, b) {
  const { error } = await supabase.from('presupuestos').update({ estado: b.estado }).eq('id', id)
  if (error) throw error
}

export async function convertirPresupuesto(presupuesto) {
  // Crear orden desde presupuesto
  const orden = await crearOrden({
    cliente_id: presupuesto.cliente_id,
    cliente_nombre: presupuesto.cliente_nombre,
    telefono: presupuesto.telefono,
    tarea_realizada: presupuesto.descripcion,
    descripcion: presupuesto.detalle || presupuesto.descripcion,
    materiales_usados: presupuesto.materiales || '',
    costos: presupuesto.monto || 0,
    estado: 'Pendiente',
  })
  // Actualizar presupuesto
  await supabase.from('presupuestos').update({ estado: 'Aprobado', orden_id: orden.id }).eq('id', presupuesto.id)
  return orden
}

// ─── Stats ────────────────────────────────────────────────────────
export async function getStats() {
  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .eq('activo', true)
    .neq('estado', 'Eliminado')
  if (error) throw error

  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()

  let totalMes = 0, tareasMes = 0
  const porEstado = { Pendiente: 0, 'En proceso': 0, Finalizada: 0, 'Pendiente de pago': 0 }
  const porCliente = {}
  const porMes = {}

  data.forEach(r => {
    const f = new Date(r.fecha)
    const costo = parseFloat(r.costos) || 0
    const est = r.estado || 'Pendiente'
    const nom = r.cliente_nombre || 'Sin cliente'
    const mesKey = f.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })

    if (porEstado[est] !== undefined) porEstado[est]++
    else porEstado[est] = (porEstado[est] || 0) + 1
    porCliente[nom] = (porCliente[nom] || 0) + costo
    porMes[mesKey] = (porMes[mesKey] || 0) + costo

    if (f.getMonth() === mesActual && f.getFullYear() === anioActual) {
      totalMes += costo
      tareasMes++
    }
  })

  const topClientes = Object.entries(porCliente)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([nombre, total]) => ({ nombre, total }))

  const evolucion = Object.entries(porMes).slice(-6)
    .map(([mes, total]) => ({ mes, total }))

  return { totalMes, tareasMes, tareasTotal: data.length, porEstado, topClientes, evolucion }
}

// ─── Historial ────────────────────────────────────────────────────
export async function getHistorial() {
  const { data, error } = await supabase
    .from('historial')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export async function addHistorial(tipo, tabla, registroId, campo, anterior, nuevo, usuarioNombre) {
  await supabase.from('historial').insert([{
    tipo, tabla, registro_id: registroId, campo,
    valor_anterior: String(anterior || ''),
    valor_nuevo: String(nuevo || ''),
    usuario_nombre: usuarioNombre || '',
  }])
}

// ─── Usuarios / Auth ──────────────────────────────────────────────
export async function loginUsuario(usuario, pass) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('usuario', usuario.toLowerCase().trim())
    .eq('password', pass.trim())
    .eq('activo', true)
    .single()
  if (error || !data) throw new Error('Usuario o contraseña incorrectos')
  return data
}

export async function getUsuarios() {
  const { data, error } = await supabase.from('usuarios').select('*').order('fecha_alta')
  if (error) throw error
  return data
}

export async function crearUsuario(b) {
  const iniciales = b.iniciales || b.nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const { data, error } = await supabase.from('usuarios').insert([{
    usuario: b.usuario.toLowerCase(),
    password: b.pass,
    nombre: b.nombre || b.usuario,
    rol: b.rol || 'tecnico',
    iniciales,
    activo: true,
  }]).select().single()
  if (error) throw error
  return data
}

export async function editarUsuario(id, b) {
  const updates = {}
  if (b.nombre !== undefined) updates.nombre = b.nombre
  if (b.rol !== undefined) updates.rol = b.rol
  if (b.iniciales !== undefined) updates.iniciales = b.iniciales
  if (b.activo !== undefined) updates.activo = b.activo
  if (b.pass) updates.password = b.pass
  const { error } = await supabase.from('usuarios').update(updates).eq('id', id)
  if (error) throw error
}
