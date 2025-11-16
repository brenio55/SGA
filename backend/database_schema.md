# Esquema do Banco de Dados - Sistema de Notificações Empresarial

## Visão Geral
Sistema SaaS multi-tenant para gerenciamento de notificações empresariais com rastreamento de visualizações e respostas por usuário e grupo.

---

## Tabelas

### 1. `companies` (Empresas - Multi-tenant)
Armazena informações das empresas que utilizam o sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da empresa |
| `name` | VARCHAR(255) NOT NULL | Nome da empresa |
| `logo_base64` | TEXT | Logo da empresa em formato base64 |
| `created_at` | TIMESTAMP DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMP DEFAULT NOW() | Data de última atualização |

**Índices:**
- `idx_companies_name` em `name`

---

### 2. `departments` (Departamentos)
Departamentos dentro de cada empresa.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do departamento |
| `company_id` | INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE | Empresa a que pertence |
| `name` | VARCHAR(255) NOT NULL | Nome do departamento |
| `color` | VARCHAR(7) | Cor hexadecimal para identificação visual |
| `created_at` | TIMESTAMP DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMP DEFAULT NOW() | Data de última atualização |

**Índices:**
- `idx_departments_company` em `company_id`
- `UNIQUE(company_id, name)` - Nome único por empresa

---

### 2.1. `groups` (Grupos/Células)
Grupos ou células dentro dos departamentos. Permite criar subdivisões para envio direcionado de notificações.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do grupo |
| `department_id` | INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE | Departamento a que pertence |
| `name` | VARCHAR(255) NOT NULL | Nome do grupo/célula |
| `description` | TEXT | Descrição do grupo (opcional) |
| `created_at` | TIMESTAMP DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMP DEFAULT NOW() | Data de última atualização |

**Índices:**
- `idx_groups_department` em `department_id`
- `UNIQUE(department_id, name)` - Nome único por departamento

---

### 3. `users` (Usuários)
Usuários do sistema vinculados a empresas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do usuário |
| `company_id` | INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE | Empresa a que pertence |
| `department_id` | INTEGER REFERENCES departments(id) ON DELETE SET NULL | Departamento do usuário |
| `group_id` | INTEGER REFERENCES groups(id) ON DELETE SET NULL | Grupo/célula do usuário (opcional) |
| `full_name` | VARCHAR(255) NOT NULL | Nome completo |
| `role` | VARCHAR(255) | Cargo/função |
| `email` | VARCHAR(255) UNIQUE | Email (para autenticação) |
| `password` | VARCHAR(255) NOT NULL | Senha criptografada do usuário |
| `image_base64` | TEXT | Foto do perfil em formato base64 |
| `created_at` | TIMESTAMP DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMP DEFAULT NOW() | Data de última atualização |

**Índices:**
- `idx_users_company` em `company_id`
- `idx_users_department` em `department_id`
- `idx_users_group` em `group_id`
- `idx_users_email` em `email`

**Observações:**
- `group_id` é opcional - usuário pode estar apenas em um departamento sem grupo específico
- Se `group_id` for fornecido, `department_id` deve corresponder ao `department_id` do grupo (validação na aplicação ou trigger)
- `password` deve ser armazenado com hash (recomendado: bcrypt)

---

### 4. `notifications` (Notificações)
Notificações criadas no sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da notificação |
| `company_id` | INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE | Empresa que criou |
| `department_id` | INTEGER REFERENCES departments(id) ON DELETE SET NULL | Departamento que criou |
| `title` | VARCHAR(255) NOT NULL | Título da notificação |
| `description` | TEXT | Descrição/conteúdo |
| `type` | VARCHAR(20) NOT NULL DEFAULT 'normal' | Tipo: 'normal', 'urgent', 'important', 'info' |
| `requires_acceptance` | BOOLEAN DEFAULT FALSE | Se requer aceitação/rejeição |
| `created_at` | TIMESTAMP DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMP DEFAULT NOW() | Data de última atualização |

**Índices:**
- `idx_notifications_company` em `company_id`
- `idx_notifications_department` em `department_id`
- `idx_notifications_type` em `type`
- `idx_notifications_created` em `created_at DESC`

**Constraints:**
- `CHECK (type IN ('normal', 'urgent', 'important', 'info'))`

---

### 5. `notification_targets` (Destinatários das Notificações)
Define quais usuários, grupos, departamentos ou todos devem receber cada notificação.
Permite flexibilidade: notificação pode ser para usuários específicos, grupos, departamentos ou todos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `notification_id` | INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE | Notificação |
| `target_type` | VARCHAR(20) NOT NULL | Tipo: 'user', 'group', 'department', 'all' |
| `target_id` | INTEGER | ID do usuário, grupo ou departamento (NULL se 'all') |
| `created_at` | TIMESTAMP DEFAULT NOW() | Data de criação |

**Índices:**
- `idx_notification_targets_notification` em `notification_id`
- `idx_notification_targets_target` em `(target_type, target_id)`

**Constraints:**
- `CHECK (target_type IN ('user', 'group', 'department', 'all'))`
- Se `target_type = 'all'`, `target_id` deve ser NULL
- Se `target_type IN ('user', 'group', 'department')`, `target_id` não pode ser NULL

---

### 6. `notification_views` (Visualizações)
Rastreia quem visualizou cada notificação e quando.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `notification_id` | INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE | Notificação visualizada |
| `user_id` | INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE | Usuário que visualizou |
| `viewed_at` | TIMESTAMP DEFAULT NOW() | Data/hora da visualização |

**Índices:**
- `idx_notification_views_notification` em `notification_id`
- `idx_notification_views_user` em `user_id`
- `UNIQUE(notification_id, user_id)` - Um usuário só visualiza uma vez

---

### 7. `notification_responses` (Respostas/Aceitações)
Rastreia aceitações e rejeições de notificações que requerem resposta.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `notification_id` | INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE | Notificação |
| `user_id` | INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE | Usuário que respondeu |
| `response_type` | VARCHAR(20) NOT NULL | Tipo: 'accepted', 'rejected' |
| `responded_at` | TIMESTAMP DEFAULT NOW() | Data/hora da resposta |

**Índices:**
- `idx_notification_responses_notification` em `notification_id`
- `idx_notification_responses_user` em `user_id`
- `UNIQUE(notification_id, user_id)` - Um usuário só pode responder uma vez

**Constraints:**
- `CHECK (response_type IN ('accepted', 'rejected'))`

---

## Relacionamentos

```
companies (1) ──< (N) departments
companies (1) ──< (N) users
companies (1) ──< (N) notifications
departments (1) ──< (N) groups
departments (1) ──< (N) users
departments (1) ──< (N) notifications
groups (1) ──< (N) users
notifications (1) ──< (N) notification_targets
notifications (1) ──< (N) notification_views
notifications (1) ──< (N) notification_responses
users (1) ──< (N) notification_views
users (1) ──< (N) notification_responses
```

---

## Funcionalidades Suportadas

### ✅ Multi-tenant (SaaS)
- Cada empresa tem seus próprios dados isolados
- Nome e logo da empresa configuráveis

### ✅ Rastreamento de Visualizações
- Contagem de visualizações por notificação
- Identificação de quem visualizou
- Data/hora da visualização

### ✅ Rastreamento por Grupo/Departamento
- Visualizações podem ser filtradas por departamento ou grupo
- Estatísticas por departamento e por grupo (células)
- Envio de notificações para grupos específicos dentro de departamentos

### ✅ Aceitação/Rejeição
- Notificações podem requerer resposta
- Rastreamento de quem aceitou/rejeitou
- Data/hora da resposta

### ✅ Tipos e Status
- Tipos: normal, urgent, important, info
- Status derivado das visualizações e respostas

---

## Queries Úteis

### Contagem de visualizações por notificação
```sql
SELECT 
  n.id,
  n.title,
  COUNT(nv.id) as view_count
FROM notifications n
LEFT JOIN notification_views nv ON n.id = nv.notification_id
WHERE n.company_id = $1
GROUP BY n.id, n.title;
```

### Quem visualizou uma notificação
```sql
SELECT 
  u.full_name,
  u.role,
  d.name as department,
  nv.viewed_at
FROM notification_views nv
JOIN users u ON nv.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
WHERE nv.notification_id = $1
ORDER BY nv.viewed_at DESC;
```

### Visualizações por departamento
```sql
SELECT 
  d.name as department,
  COUNT(DISTINCT nv.user_id) as users_viewed,
  COUNT(nv.id) as total_views
FROM notification_views nv
JOIN users u ON nv.user_id = u.id
JOIN departments d ON u.department_id = d.id
WHERE nv.notification_id = $1
GROUP BY d.id, d.name;
```

### Visualizações por grupo/célula
```sql
SELECT 
  g.name as group_name,
  d.name as department,
  COUNT(DISTINCT nv.user_id) as users_viewed,
  COUNT(nv.id) as total_views
FROM notification_views nv
JOIN users u ON nv.user_id = u.id
JOIN groups g ON u.group_id = g.id
JOIN departments d ON g.department_id = d.id
WHERE nv.notification_id = $1
GROUP BY g.id, g.name, d.name;
```

### Usuários de um grupo específico
```sql
SELECT 
  u.id,
  u.full_name,
  u.role,
  u.email
FROM users u
WHERE u.group_id = $1
ORDER BY u.full_name;
```

### Notificações enviadas para um grupo
```sql
SELECT 
  n.id,
  n.title,
  n.type,
  n.created_at
FROM notifications n
JOIN notification_targets nt ON n.id = nt.notification_id
WHERE nt.target_type = 'group' AND nt.target_id = $1
ORDER BY n.created_at DESC;
```

### Status de uma notificação para um usuário
```sql
SELECT 
  CASE 
    WHEN nr.response_type = 'accepted' THEN 'accepted'
    WHEN nr.response_type = 'rejected' THEN 'rejected'
    WHEN nv.id IS NOT NULL THEN 'read'
    ELSE 'pending'
  END as status,
  nv.viewed_at,
  nr.responded_at
FROM notifications n
LEFT JOIN notification_views nv ON n.id = nv.notification_id AND nv.user_id = $2
LEFT JOIN notification_responses nr ON n.id = nr.notification_id AND nr.user_id = $2
WHERE n.id = $1;
```

---

## Observações

1. **Status da Notificação**: O status (pending, read, accepted, rejected) é calculado dinamicamente baseado nas tabelas `notification_views` e `notification_responses`, não sendo armazenado diretamente.

2. **Soft Delete**: Se necessário no futuro, pode-se adicionar coluna `deleted_at` para soft delete.

3. **Auditoria**: As colunas `created_at` e `updated_at` permitem auditoria básica.

4. **Performance**: Índices criados para otimizar consultas frequentes.

5. **Segurança**: Todos os relacionamentos usam `ON DELETE CASCADE` ou `ON DELETE SET NULL` conforme apropriado.

6. **Armazenamento de Imagens**: Logo da empresa e foto do usuário são armazenadas em base64 diretamente no banco de dados.

7. **Grupos/Células**: Sistema permite criar grupos dentro de departamentos para envio direcionado de notificações. Usuários podem pertencer a um grupo específico ou apenas a um departamento.

8. **Autenticação**: Campo `password` adicionado para autenticação de usuários. Recomenda-se usar hash (bcrypt) antes de armazenar.

