import { Routes, Route, Navigate } from 'react-router-dom'
import Header from '../Header'
import AdminLayout from '../components/Admin/AdminLayout'
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
          <Route path="/companies" element={<AdminCompanies />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/departments" element={<AdminDepartments />} />
          <Route path="/groups" element={<AdminGroups />} />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </div>
  )
}

export default Admin

