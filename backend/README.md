# Backend - Sistema de Notificações Empresarial

## Estrutura do Projeto

```
backend/
├── migrations/          # Migrações do banco de dados
├── models/             # Modelos de dados
├── controllers/        # Lógica de negócio
├── routes/            # Definição de rotas
├── scripts/           # Scripts utilitários
├── app.js             # Arquivo principal
└── db.js              # Configuração do banco de dados
```

## Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente (criar arquivo `.env`):
```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
```

3. Executar migrações:
```bash
npm run migrate
```

4. Iniciar servidor:
```bash
npm start
```

## Endpoints da API

### Companies (Empresas)
- `GET /api/companies` - Listar todas as empresas
- `GET /api/companies/:id` - Buscar empresa por ID
- `POST /api/companies` - Criar empresa
- `PUT /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Deletar empresa

### Departments (Departamentos)
- `GET /api/departments?company_id=1` - Listar departamentos
- `GET /api/departments/:id` - Buscar departamento por ID
- `POST /api/departments` - Criar departamento
- `PUT /api/departments/:id` - Atualizar departamento
- `DELETE /api/departments/:id` - Deletar departamento

### Groups (Grupos/Células)
- `GET /api/groups?department_id=1` - Listar grupos
- `GET /api/groups/:id` - Buscar grupo por ID
- `POST /api/groups` - Criar grupo
- `PUT /api/groups/:id` - Atualizar grupo
- `DELETE /api/groups/:id` - Deletar grupo

### Users (Usuários)
- `GET /api/users?company_id=1` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `GET /api/users/group/:group_id` - Listar usuários de um grupo
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Notifications (Notificações)
- `GET /api/notifications?company_id=1` - Listar notificações
- `GET /api/notifications/:id` - Buscar notificação por ID
- `GET /api/notifications/user/:user_id/company/:company_id` - Notificações de um usuário
- `POST /api/notifications` - Criar notificação
- `PUT /api/notifications/:id` - Atualizar notificação
- `DELETE /api/notifications/:id` - Deletar notificação
- `POST /api/notifications/:id/view` - Registrar visualização
- `POST /api/notifications/:id/respond` - Responder notificação (aceitar/rejeitar)
- `GET /api/notifications/:id/views?group_by=department` - Visualizações agrupadas

## Exemplos de Uso

### Criar uma empresa
```json
POST /api/companies
{
  "name": "Minha Empresa",
  "logo_base64": "data:image/png;base64,..."
}
```

### Criar um usuário
```json
POST /api/users
{
  "company_id": 1,
  "department_id": 1,
  "group_id": 1,
  "full_name": "João Silva",
  "role": "Analista",
  "email": "joao@empresa.com",
  "password": "senha123",
  "image_base64": "data:image/jpeg;base64,..."
}
```

### Criar uma notificação
```json
POST /api/notifications
{
  "company_id": 1,
  "department_id": 1,
  "title": "Nova atualização",
  "description": "Descrição da notificação",
  "type": "important",
  "requires_acceptance": true,
  "targets": [
    { "target_type": "group", "target_id": 1 },
    { "target_type": "user", "target_id": 5 }
  ]
}
```

### Registrar visualização
```json
POST /api/notifications/1/view
{
  "user_id": 1
}
```

### Responder notificação
```json
POST /api/notifications/1/respond
{
  "user_id": 1,
  "response_type": "accepted"
}
```

## Tipos de Notificação

- `normal` - Notificação normal
- `urgent` - Notificação urgente
- `important` - Notificação importante
- `info` - Notificação informativa

## Tipos de Destinatários

- `all` - Todos os usuários da empresa
- `department` - Todos os usuários de um departamento
- `group` - Todos os usuários de um grupo
- `user` - Usuário específico

