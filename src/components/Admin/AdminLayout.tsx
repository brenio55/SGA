import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole, canManageCompanies, canManageUsers, canCreateNotifications, hasPermission } from '../../utils/roles'
import './AdminLayout.css'

interface AdminLayoutProps {
  children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const location = useLocation()
  const userRole = user?.role || ''

  // Construir menu baseado nas permissões
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', show: true },
    { 
      path: '/admin/companies', 
      label: 'Empresas', 
      icon: '🏢', 
      show: canManageCompanies(userRole) 
    },
    { 
      path: '/admin/users', 
      label: 'Usuários', 
      icon: '👥', 
      show: canManageUsers(userRole) 
    },
    { 
      path: '/admin/departments', 
      label: 'Departamentos', 
      icon: '📁', 
      show: hasPermission(userRole as UserRole, UserRole.MANAGER) 
    },
    { 
      path: '/admin/groups', 
      label: 'Grupos', 
      icon: '👤', 
      show: hasPermission(userRole as UserRole, UserRole.MANAGER) 
    },
    { 
      path: '/admin/notifications', 
      label: 'Notificações', 
      icon: '🔔', 
      show: canCreateNotifications(userRole) 
    },
  ].filter(item => item.show)

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <nav className="admin-layout__nav">
          <h2 className="admin-layout__nav-title">Menu</h2>
          <ul className="admin-layout__nav-list">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`admin-layout__nav-item ${isActive ? 'admin-layout__nav-item--active' : ''}`}
                  >
                    <span className="admin-layout__nav-icon">{item.icon}</span>
                    <span className="admin-layout__nav-label">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
      <main className="admin-layout__content">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout

