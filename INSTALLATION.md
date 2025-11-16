# Instalação e Configuração

## 📦 Pacotes a Instalar

Execute os seguintes comandos na raiz do projeto:

```bash
npm install react-router-dom
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend:

```env
VITE_API_URL=http://localhost:3001/api
```

### 2. Estrutura Criada

O sistema foi estruturado com:

- ✅ Sistema de roles (super_admin, admin, manager, moderator, user)
- ✅ Tela de cadastro inicial para super_admin
- ✅ AuthContext para gerenciamento de autenticação
- ✅ Serviços de API
- ✅ Header com botão admin (visível apenas para admins)
- ✅ Roteamento básico
- ✅ Estrutura do painel administrativo
- ✅ Componentes placeholder para CRUDs

## 🚀 Próximos Passos

1. Instalar dependências: `npm install react-router-dom`
2. Executar migrações do backend: `cd backend && npm run migrate`
3. Iniciar backend: `cd backend && npm start`
4. Iniciar frontend: `npm run dev`

## 📝 Notas

- O sistema de login ainda está mockado - será necessário implementar endpoint de autenticação no backend
- Os componentes de CRUD (Companies, Users, etc.) são placeholders e precisam ser implementados
- A tela de cadastro inicial cria empresa e usuário super_admin automaticamente

