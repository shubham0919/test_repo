-- users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email TEXT UNIQUE NOT NULL,
    github_id TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects table
CREATE TABLE projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tokens table
CREATE TABLE tokens (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- versions table
CREATE TABLE versions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    changes_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- plans table
CREATE TABLE plans (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT UNIQUE NOT NULL,
    price INTEGER,
    limits_json JSONB
);

-- api_keys table
CREATE TABLE api_keys (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
