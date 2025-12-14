// Sistema de Roles e Permissões

export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MODERATOR: 'moderator',
  USER: 'user'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.MODERATOR]: 2,
  [UserRole.USER]: 1
}

export const RoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrador',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.MODERATOR]: 'Moderador',
  [UserRole.USER]: 'Usuário'
}

// Verifica se um role tem permissão para executar uma ação
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole]
}

// Verifica se é super admin
export function isSuperAdmin(role: string): boolean {
  return role === UserRole.SUPER_ADMIN
}

// Verifica se é admin ou superior
export function isAdmin(role: string): boolean {
  return hasPermission(role as UserRole, UserRole.ADMIN)
}

// Verifica se pode gerenciar usuários
export function canManageUsers(role: string): boolean {
  return hasPermission(role as UserRole, UserRole.ADMIN)
}

// Verifica se pode gerenciar empresas
export function canManageCompanies(role: string): boolean {
  return role === UserRole.SUPER_ADMIN
}

// Verifica se pode criar notificações para grupos
export function canCreateGroupNotifications(role: string): boolean {
  return hasPermission(role as UserRole, UserRole.MANAGER)
}

// Verifica se pode criar notificações
export function canCreateNotifications(role: string): boolean {
  return hasPermission(role as UserRole, UserRole.MODERATOR)
}

