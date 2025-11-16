import { Routes, Route, Navigate } from 'react-router-dom'
import Header from '../Header'
import AdminLayout from '../components/Admin/AdminLayout'
import AdminRoute from '../components/Admin/AdminRoute'
import AdminDashboard from '../components/Admin/AdminDashboard'
import AdminCompanies from '../components/Admin/AdminCompanies'
import AdminUsers from '../components/Admin/AdminUsers'
import AdminDepartments from '../components/Admin/AdminDepartments'
import AdminGroups from '../components/Admin/AdminGroups'
import AdminNotifications from '../components/Admin/AdminNotifications'
import './Admin.css'

function Admin() {
  return (
    <div className="admin">
      <Header />
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route 
            path="/companies" 
            element={
              <AdminRoute requireSuperAdmin>
                <AdminCompanies />
              </AdminRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <AdminRoute requireAdmin>
                <AdminUsers />
              </AdminRoute>
            } 
          />
          <Route 
            path="/departments" 
            element={
              <AdminRoute requireManager>
                <AdminDepartments />
              </AdminRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <AdminRoute requireManager>
                <AdminGroups />
              </AdminRoute>
            } 
          />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </div>
  )
}

export default Admin

