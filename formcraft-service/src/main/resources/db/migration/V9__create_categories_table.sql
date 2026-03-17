-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Templates table to link to category
-- First, add the column
ALTER TABLE templates ADD COLUMN category_id INTEGER REFERENCES categories(id);

-- Migration of existing categories (optional if no data yet)
-- For now, we'll keep the old 'category' column as a backup or drop it later.
-- We'll keep it for simplicity in this phase.

-- Seed initial standard categories
INSERT INTO categories (name, label) VALUES 
('USER_REGISTRATION', 'User Registration'),
('CONTACT_PROTOCOL', 'Contact Us'),
('FEEDBACK_SURVEY', 'Feedback & Survey'),
('SERVICE_REQUEST', 'Service Request'),
('EVENT_RSVP', 'Event RSVP')
ON CONFLICT (name) DO NOTHING;
