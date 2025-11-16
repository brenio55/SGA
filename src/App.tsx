import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { UserRole } from './utils/roles'

// Pages
import InitialRegister from './pages/InitialRegister'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Carregando...</p>
      </div>
    )
  }

  // Se não há usuários cadastrados, mostrar tela de cadastro inicial
  // Por enquanto, verificar se não está autenticado
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/register" element={<InitialRegister />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
