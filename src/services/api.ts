// Serviço de API - Chamadas para o backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')
    
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      
      if (isJson) {
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // Se não conseguir fazer parse, usar mensagem padrão
          console.error('Erro ao fazer parse do JSON de erro:', parseError)
        }
      } else {
        // Se não for JSON, tentar ler como texto
        try {
          const text = await response.text()
          errorMessage = text || errorMessage
        } catch {
          // Se não conseguir ler como texto, usar mensagem padrão
        }
      }
      
      throw new Error(errorMessage)
    }

    // Se chegou aqui, a resposta foi OK
    if (!isJson) {
      throw new Error('Resposta do servidor não é JSON válido')
    }

    try {
      return await response.json()
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON da resposta:', parseError)
      throw new Error('Resposta do servidor não é JSON válido')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro desconhecido na requisição')
  }
}

// ========== AUTH ==========
export const authApi = {
  register: async (userData: {
    company_id?: number
    department_id?: number
    group_id?: number
    full_name: string
    role: string
    email: string
    password: string
    image_base64?: string
  }) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  login: async (email: string, _password: string) => {
    // TODO: Implementar endpoint de login no backend
    // Por enquanto, retornar mock
    return { token: 'mock-token', user: { email, role: 'super_admin' } }
  },
}

// ========== COMPANIES ==========
export const companiesApi = {
  getAll: () => request('/companies'),
  getById: (id: number) => request(`/companies/${id}`),
  create: (data: { name: string; logo_base64?: string }) =>
    request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; logo_base64?: string }) =>
    request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request(`/companies/${id}`, {
      method: 'DELETE',
    }),
}

// ========== USERS ==========
export const usersApi = {
  getAll: (companyId?: number) => {
    const query = companyId ? `?company_id=${companyId}` : ''
    return request(`/users${query}`)
  },
  getById: (id: number) => request(`/users/${id}`),
  getByGroup: (groupId: number) => request(`/users/group/${groupId}`),
  create: (data: {
    company_id: number
    department_id?: number
    group_id?: number
    full_name: string
    role: string
    email: string
    password: string
    image_base64?: string
  }) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<{
    department_id?: number
    group_id?: number
    full_name?: string
    role?: string
    email?: string
    password?: string
    image_base64?: string
  }>) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
}

// ========== DEPARTMENTS ==========
export const departmentsApi = {
  getAll: (companyId?: number) => {
    const query = companyId ? `?company_id=${companyId}` : ''
    return request(`/departments${query}`)
  },
  getById: (id: number) => request(`/departments/${id}`),
  create: (data: { company_id: number; name: string; color?: string }) =>
    request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; color?: string }) =>
    request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request(`/departments/${id}`, {
      method: 'DELETE',
    }),
}

// ========== GROUPS ==========
export const groupsApi = {
  getAll: (departmentId?: number) => {
    const query = departmentId ? `?department_id=${departmentId}` : ''
    return request(`/groups${query}`)
  },
  getById: (id: number) => request(`/groups/${id}`),
  create: (data: { department_id: number; name: string; description?: string }) =>
    request('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; description?: string }) =>
    request(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request(`/groups/${id}`, {
      method: 'DELETE',
    }),
}

// ========== NOTIFICATIONS ==========
export const notificationsApi = {
  getAll: (companyId?: number) => {
    const query = companyId ? `?company_id=${companyId}` : ''
    return request(`/notifications${query}`)
  },
  getById: (id: number) => request(`/notifications/${id}`),
  getForUser: (userId: number, companyId: number) =>
    request(`/notifications/user/${userId}/company/${companyId}`),
  create: (data: {
    company_id: number
    department_id?: number
    title: string
    description: string
    type: string
    requires_acceptance: boolean
    targets?: Array<{ target_type: string; target_id?: number }>
  }) =>
    request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<{
    title: string
    description: string
    type: string
    requires_acceptance: boolean
    targets?: Array<{ target_type: string; target_id?: number }>
  }>) =>
    request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request(`/notifications/${id}`, {
      method: 'DELETE',
    }),
  view: (id: number, userId: number) =>
    request(`/notifications/${id}/view`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
  respond: (id: number, userId: number, responseType: 'accepted' | 'rejected') =>
    request(`/notifications/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, response_type: responseType }),
    }),
  getViews: (id: number, groupBy?: 'department' | 'group') => {
    const query = groupBy ? `?group_by=${groupBy}` : ''
    return request(`/notifications/${id}/views${query}`)
  },
        getViewedByUser: (userId: number, companyId: number) =>
          request(`/notifications/user/${userId}/company/${companyId}/viewed`),
        getStatsForUser: (userId: number, companyId: number) =>
          request(`/notifications/user/${userId}/company/${companyId}/stats`),
      }

