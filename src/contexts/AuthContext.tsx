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
  login: (email: string, password: string) => Promise<void>
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
          setUser(JSON.parse(storedUser))
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

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implementar chamada real à API quando backend tiver endpoint de login
      // Por enquanto, mock para desenvolvimento
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
      })
      
      const users = await response.json()
      const foundUser = users.find((u: any) => u.email === email)
      
      if (!foundUser) {
        throw new Error('Usuário não encontrado')
      }

      // Em produção, o backend deve verificar a senha
      // Por enquanto, apenas salvar o usuário
      const userData: User = {
        id: foundUser.id,
        company_id: foundUser.company_id,
        department_id: foundUser.department_id,
        group_id: foundUser.group_id,
        full_name: foundUser.full_name,
        role: foundUser.role,
        email: foundUser.email,
        image_base64: foundUser.image_base64,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', 'mock-token') // TODO: usar token real
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

