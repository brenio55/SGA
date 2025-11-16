# Plano de Implementação - Frontend Admin e Sistema de Roles

## 📋 Visão Geral

Implementação de sistema de administração com controle de acesso baseado em roles, tela de cadastro e painel administrativo.

---

## 🎯 Funcionalidades a Implementar

### 1. Sistema de Roles (Papéis de Usuário)

**Roles propostos:**
- `admin` - Administrador completo (acesso total)
- `manager` - Gerente (pode criar notificações para grupos/departamentos)
- `user` - Usuário normal (apenas visualiza e responde notificações)
- `moderator` - Moderador (pode criar notificações, mas não gerencia usuários)

**Hierarquia de permissões:**
```
admin > manager > moderator > user
```

**Permissões por role:**

| Funcionalidade | admin | manager | moderator | user |
|----------------|-------|---------|-----------|------|
| Visualizar notificações | ✅ | ✅ | ✅ | ✅ |
| Responder notificações | ✅ | ✅ | ✅ | ✅ |
| Criar notificações (todos) | ✅ | ✅ | ✅ | ❌ |
| Criar notificações (grupos) | ✅ | ✅ | ❌ | ❌ |
| Criar notificações (departamentos) | ✅ | ✅ | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |
| Gerenciar empresas | ✅ | ❌ | ❌ | ❌ |
| Gerenciar departamentos | ✅ | ✅ | ❌ | ❌ |
| Gerenciar grupos | ✅ | ✅ | ❌ | ❌ |

---

### 2. Tela de Cadastro

**Localização:** Nova rota `/register` ou modal

**Campos:**
- Nome completo (obrigatório)
- Email (obrigatório, único)
- Senha (obrigatório, mínimo 6 caracteres)
- Confirmar senha (obrigatório)
- Empresa (seleção - apenas se não houver empresa selecionada)
- Departamento (seleção opcional)
- Grupo/Célula (seleção opcional, depende do departamento)
- Foto (upload opcional, convertido para base64)

**Validações:**
- Email único no sistema
- Senha e confirmar senha devem ser iguais
- Role padrão: `user` (não editável no cadastro)
- Empresa obrigatória se for primeiro cadastro

**Comportamento:**
- Após cadastro bem-sucedido, redirecionar para login
- Mostrar mensagem de sucesso

---

### 3. Botão de Administrador no Header

**Localização:** Canto superior direito do header, ao lado dos quadrados de data/hora

**Estilo:**
- Mesmo formato dos quadrados existentes (`.header__date`, `.header__time`)
- Ícone: ⚙️ ou 🛠️ ou ícone de engrenagem
- Texto: "Admin" ou apenas ícone
- Cor: Mesmo estilo (background rgba(255, 255, 255, 0.1), border, etc)

**Visibilidade:**
- Apenas visível se `user.role === 'admin'`
- Ao clicar, navega para `/admin` ou abre painel admin

**Estrutura CSS:**
```css
.header__admin-button {
  /* Mesmo estilo dos outros quadrados */
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: background 0.2s ease;
}
```

---

### 4. Tela de Administrador (`/admin`)

**Estrutura:**
```
/admin
├── Dashboard (visão geral)
├── Empresas
│   ├── Listar empresas
│   ├── Criar empresa
│   ├── Editar empresa
│   └── Deletar empresa
├── Usuários
│   ├── Listar usuários
│   ├── Criar usuário
│   ├── Editar usuário (incluindo role)
│   └── Deletar usuário
├── Departamentos
│   ├── Listar departamentos
│   ├── Criar departamento
│   ├── Editar departamento
│   └── Deletar departamento
├── Grupos
│   ├── Listar grupos
│   ├── Criar grupo
│   ├── Editar grupo
│   └── Deletar grupo
└── Notificações
    ├── Criar notificação (com seleção de grupos)
    ├── Listar notificações
    └── Ver estatísticas
```

**Layout:**
- Sidebar com menu de navegação
- Área principal com conteúdo
- Header mantido (com botão admin)
- Breadcrumbs para navegação

**Componentes:**
- `AdminLayout.tsx` - Layout principal
- `AdminSidebar.tsx` - Menu lateral
- `AdminDashboard.tsx` - Dashboard
- `AdminCompanies.tsx` - Gerenciamento de empresas
- `AdminUsers.tsx` - Gerenciamento de usuários
- `AdminDepartments.tsx` - Gerenciamento de departamentos
- `AdminGroups.tsx` - Gerenciamento de grupos
- `AdminNotifications.tsx` - Criar/listar notificações

---

### 5. Criação de Notificações para Grupos

**Quem pode:**
- `admin` - Pode criar para qualquer grupo
- `manager` - Pode criar para grupos do seu departamento

**Interface:**
- Formulário de criação de notificação
- Seleção de destinatários:
  - Radio buttons ou tabs: "Todos", "Departamento", "Grupo", "Usuário específico"
  - Se "Grupo" selecionado:
    - Dropdown de departamentos (filtra grupos)
    - Dropdown de grupos (filtrado por departamento)
    - Possibilidade de selecionar múltiplos grupos
  - Se "Departamento" selecionado:
    - Dropdown de departamentos
    - Possibilidade de selecionar múltiplos departamentos

**Campos do formulário:**
- Título (obrigatório)
- Descrição (obrigatório)
- Tipo (normal, urgent, important, info)
- Requer aceitação (checkbox)
- Destinatários (obrigatório)

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── Notification.tsx (existente)
│   ├── RegisterForm.tsx (NOVO)
│   └── Admin/
│       ├── AdminLayout.tsx
│       ├── AdminSidebar.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminCompanies.tsx
│       ├── AdminUsers.tsx
│       ├── AdminDepartments.tsx
│       ├── AdminGroups.tsx
│       └── AdminNotifications.tsx
├── pages/
│   ├── Register.tsx (NOVO)
│   └── Admin.tsx (NOVO - roteamento)
├── classes/
│   ├── Notification.ts (existente)
│   ├── UserProfile.ts (existente - atualizar com role)
│   └── UserRole.ts (NOVO - enum de roles)
├── services/
│   ├── api.ts (NOVO - chamadas à API)
│   └── auth.ts (NOVO - gerenciamento de autenticação)
├── contexts/
│   └── AuthContext.tsx (NOVO - contexto de autenticação)
├── utils/
│   └── permissions.ts (NOVO - verificação de permissões)
├── Header.tsx (atualizar - adicionar botão admin)
├── App.tsx (atualizar - adicionar rotas)
└── main.tsx (atualizar - adicionar router)
```

---

## 🔐 Gerenciamento de Autenticação

**Context API:**
- `AuthContext` para gerenciar estado do usuário logado
- Funções: `login`, `logout`, `register`, `getCurrentUser`
- Armazenar token/sessão no localStorage

**Proteção de Rotas:**
- Componente `ProtectedRoute` para rotas que requerem autenticação
- Componente `AdminRoute` para rotas que requerem role admin
- Redirecionar para login se não autenticado

---

## 🎨 Design e UX

**Tela de Cadastro:**
- Formulário limpo e simples
- Validação em tempo real
- Mensagens de erro claras
- Loading state durante submissão

**Tela de Admin:**
- Design consistente com o resto da aplicação
- Cards para estatísticas no dashboard
- Tabelas para listagem (com paginação se necessário)
- Modais para criação/edição
- Confirmação antes de deletar

**Botão Admin no Header:**
- Hover effect (background mais claro)
- Tooltip: "Painel Administrativo"
- Ícone + texto ou apenas ícone (responsivo)

---

## 🔄 Fluxo de Navegação

```
Login/Register
    ↓
Dashboard Principal (notificações)
    ↓ (se admin)
Painel Admin
    ├── Empresas
    ├── Usuários
    ├── Departamentos
    ├── Grupos
    └── Notificações
```

---

## 📝 Observações

1. **Backend já suporta:**
   - Roles no campo `role` da tabela `users`
   - Criação de notificações com targets (grupos, departamentos, etc)
   - Todas as operações CRUD necessárias

2. **Validações no Frontend:**
   - Verificar role antes de mostrar botão admin
   - Verificar permissões antes de permitir ações
   - Mostrar mensagens apropriadas se sem permissão

3. **Validações no Backend (futuro):**
   - Middleware de autenticação
   - Middleware de autorização por role
   - Validação de permissões nas rotas

4. **Melhorias Futuras:**
   - Sistema de permissões mais granular
   - Auditoria de ações administrativas
   - Logs de atividades

---

## ✅ Checklist de Implementação

### Fase 1: Base
- [ ] Criar enum/constantes de roles
- [ ] Atualizar UserProfile com role
- [ ] Criar AuthContext
- [ ] Criar serviço de API
- [ ] Criar utilitário de permissões

### Fase 2: Cadastro
- [ ] Criar componente RegisterForm
- [ ] Criar página Register
- [ ] Integrar com API de cadastro
- [ ] Validações e tratamento de erros

### Fase 3: Header e Navegação
- [ ] Adicionar botão admin no Header
- [ ] Implementar roteamento
- [ ] Criar rotas protegidas

### Fase 4: Painel Admin
- [ ] Criar AdminLayout
- [ ] Criar AdminSidebar
- [ ] Criar AdminDashboard
- [ ] Criar AdminCompanies
- [ ] Criar AdminUsers
- [ ] Criar AdminDepartments
- [ ] Criar AdminGroups
- [ ] Criar AdminNotifications (com seleção de grupos)

### Fase 5: Testes e Ajustes
- [ ] Testar fluxo completo
- [ ] Ajustar estilos
- [ ] Corrigir bugs
- [ ] Otimizar performance

---

## 🚀 Ordem de Implementação Sugerida

1. **Primeiro:** Sistema de roles e autenticação básica
2. **Segundo:** Tela de cadastro
3. **Terceiro:** Botão admin no header
4. **Quarto:** Estrutura básica do painel admin
5. **Quinto:** Funcionalidades do painel (CRUDs)
6. **Sexto:** Criação de notificações com grupos

---

## ❓ Questões para Revisão

1. **Roles:** Os 4 roles propostos (admin, manager, moderator, user) atendem suas necessidades?
2. **Cadastro:** Prefere modal ou página separada para cadastro?
3. **Admin Layout:** Prefere sidebar fixa ou menu hambúrguer (mobile)?
4. **Notificações:** Managers podem criar para grupos de outros departamentos ou apenas do seu?
5. **Validação:** Prefere validação em tempo real ou apenas no submit?

---

**Aguardando sua revisão antes de iniciar a implementação!** 🎯

