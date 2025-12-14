import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole, hasPermission, canManageUsers } from '../../utils/roles'

interface AdminRouteProps {
  children: ReactNode
  requireSuperAdmin?: boolean
  requireAdmin?: boolean
  requireManager?: boolean
}

function AdminRoute({ children, requireSuperAdmin, requireAdmin, requireManager }: AdminRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    )
  }

  if (requireSuperAdmin && user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser Super Administrador para acessar esta página.</p>
      </div>
    )
  }

  if (requireAdmin && !canManageUsers(user.role)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser Administrador para acessar esta página.</p>
      </div>
    )
  }

  if (requireManager && !hasPermission(user.role as UserRole, UserRole.MANAGER)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminRoute

