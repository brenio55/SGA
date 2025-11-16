import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole, canManageCompanies } from '../../utils/roles'
import './AdminLayout.css'

interface AdminLayoutProps {
  children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const location = useLocation()
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    ...(isSuperAdmin ? [{ path: '/admin/companies', label: 'Empresas', icon: '🏢' }] : []),
    { path: '/admin/users', label: 'Usuários', icon: '👥' },
    { path: '/admin/departments', label: 'Departamentos', icon: '📁' },
    { path: '/admin/groups', label: 'Grupos', icon: '👤' },
    { path: '/admin/notifications', label: 'Notificações', icon: '🔔' },
  ]

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

