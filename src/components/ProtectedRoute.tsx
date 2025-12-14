import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole, hasPermission } from '../utils/roles'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
  requireSuperAdmin?: boolean
}

function ProtectedRoute({ children, requiredRole, requireSuperAdmin }: ProtectedRouteProps) {
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

  if (!isAuthenticated || !user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    )
  }

  if (requireSuperAdmin && user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser Super Administrador para acessar esta página.</p>
      </div>
    )
  }

  if (requiredRole) {
    if (!hasPermission(user.role as UserRole, requiredRole)) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

