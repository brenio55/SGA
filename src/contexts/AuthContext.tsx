import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole } from '../utils/roles'

interface User {
  id: number
  company_id: number
  department_id?: number
  group_id?: number
  full_name: string
  role: string
  email: string
  image_base64?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (companyId: number, email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

interface RegisterData {
  company_id?: number
  department_id?: number
  group_id?: number
  full_name: string
  role: string
  email: string
  password: string
  image_base64?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        
        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser)
            // Validar se o objeto parseado tem a estrutura esperada
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
              setUser(parsedUser)
            } else {
              // Se o formato estiver incorreto, limpar
              console.warn('Formato de usuário inválido no localStorage')
              localStorage.removeItem('user')
              localStorage.removeItem('token')
            }
          } catch (parseError) {
            console.error('Erro ao fazer parse do usuário do localStorage:', parseError)
            localStorage.removeItem('user')
            localStorage.removeItem('token')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (companyId: number, email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          email,
          password,
        }),
      })

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type')
      const isJson = contentType && contentType.includes('application/json')

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login'
        
        if (isJson) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            // Se não conseguir fazer parse do JSON, usar mensagem padrão
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
        } else {
          // Se não for JSON, tentar ler como texto
          try {
            const text = await response.text()
            errorMessage = text || errorMessage
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
        }
        
        throw new Error(errorMessage)
      }

      // Se chegou aqui, a resposta foi OK
      if (!isJson) {
        throw new Error('Resposta do servidor não é JSON válido')
      }

      const data = await response.json()
      
      if (!data.user) {
        throw new Error('Dados do usuário não encontrados na resposta')
      }

      const userData: User = {
        id: data.user.id,
        company_id: data.user.company_id,
        department_id: data.user.department_id,
        group_id: data.user.group_id,
        full_name: data.user.full_name,
        role: data.user.role,
        email: data.user.email,
        image_base64: data.user.image_base64,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', data.token || 'mock-token')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro ao fazer login')
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const { authApi } = await import('../services/api')
      const newUser = await authApi.register(userData)
      
      // Remover senha da resposta
      const { password: _, ...userWithoutPassword } = newUser
      
      const registeredUser: User = {
        id: userWithoutPassword.id,
        company_id: userWithoutPassword.company_id,
        department_id: userWithoutPassword.department_id,
        group_id: userWithoutPassword.group_id,
        full_name: userWithoutPassword.full_name,
        role: userWithoutPassword.role,
        email: userWithoutPassword.email,
        image_base64: userWithoutPassword.image_base64,
      }

      setUser(registeredUser)
      localStorage.setItem('user', JSON.stringify(registeredUser))
      localStorage.setItem('token', 'mock-token') // TODO: usar token real
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro ao registrar usuário')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

