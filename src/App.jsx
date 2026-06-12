import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clientes from './pages/Clientes.jsx'
import Ordenes from './pages/Ordenes.jsx'
import Presupuestos from './pages/Presupuestos.jsx'
import Historial from './pages/Historial.jsx'
import Usuarios from './pages/Usuarios.jsx'

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('td_user')) } catch { return null }
  })

  const login = (u) => {
    localStorage.setItem('td_user', JSON.stringify(u))
    setUsuario(u)
  }

  const logout = () => {
    localStorage.removeItem('td_user')
    setUsuario(null)
  }

  if (!usuario) return <Login onLogin={login} />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout usuario={usuario} onLogout={logout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ordenes" element={<Ordenes usuario={usuario} />} />
          <Route path="/clientes" element={<Clientes usuario={usuario} />} />
          <Route path="/presupuestos" element={<Presupuestos usuario={usuario} />} />
          <Route path="/historial" element={<Historial />} />
          {usuario.rol === 'admin' && (
            <Route path="/usuarios" element={<Usuarios usuario={usuario} />} />
          )}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
