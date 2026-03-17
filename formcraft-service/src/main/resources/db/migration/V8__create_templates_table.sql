-- Create Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    schema JSONB NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Insert ROLE_SUPER_ADMIN
INSERT INTO roles (name) 
SELECT 'ROLE_SUPER_ADMIN' 
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_SUPER_ADMIN');
