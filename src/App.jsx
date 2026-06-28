import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Pin from './pages/Pin.jsx'
import Home from './pages/Home.jsx'
import Biblioteca from './pages/Biblioteca.jsx'
import Livro from './pages/Livro.jsx'
import Stats from './pages/Stats.jsx'
import Layout from './components/Layout.jsx'

function Protected({ children }) {
  const { authed, loading } = useAuth()
  if (loading) return null
  if (!authed) return <Navigate to="/pin" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/pin" element={<Pin />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Home />} />
            <Route path="biblioteca" element={<Biblioteca />} />
            <Route path="livro/:id" element={<Livro />} />
            <Route path="stats" element={<Stats />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
