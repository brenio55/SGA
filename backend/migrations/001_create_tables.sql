-- Migração: Criação das tabelas do sistema de notificações empresarial
-- Data: 2024

-- ============================================
-- 1. Tabela: companies (Empresas - Multi-tenant)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_base64 TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- ============================================
-- 2. Tabela: departments (Departamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_departments_company ON departments(company_id);

-- ============================================
-- 2.1. Tabela: groups (Grupos/Células)
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(department_id, name)
);

CREATE INDEX IF NOT EXISTS idx_groups_department ON groups(department_id);

-- ============================================
-- 3. Tabela: users (Usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    image_base64 TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_group ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 4. Tabela: notifications (Notificações)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'normal',
    requires_acceptance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (type IN ('normal', 'urgent', 'important', 'info'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_department ON notifications(department_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 5. Tabela: notification_targets (Destinatários)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_targets (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    target_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (target_type IN ('user', 'group', 'department', 'all')),
    CHECK (
        (target_type = 'all' AND target_id IS NULL) OR
        (target_type IN ('user', 'group', 'department') AND target_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_notification_targets_notification ON notification_targets(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_targets_target ON notification_targets(target_type, target_id);

-- ============================================
-- 6. Tabela: notification_views (Visualizações)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_views (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_views_notification ON notification_views(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_views_user ON notification_views(user_id);

-- ============================================
-- 7. Tabela: notification_responses (Respostas)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_responses (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_type VARCHAR(20) NOT NULL,
    responded_at TIMESTAMP DEFAULT NOW(),
    CHECK (response_type IN ('accepted', 'rejected')),
    UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_responses_notification ON notification_responses(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_responses_user ON notification_responses(user_id);

-- ============================================
-- Trigger: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger: Validar que group_id corresponde ao department_id
-- ============================================
CREATE OR REPLACE FUNCTION validate_user_group_department()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.group_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM groups 
            WHERE id = NEW.group_id 
            AND department_id = NEW.department_id
        ) THEN
            RAISE EXCEPTION 'O grupo especificado não pertence ao departamento do usuário';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_user_group_department_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    WHEN (NEW.group_id IS NOT NULL)
    EXECUTE FUNCTION validate_user_group_department();

