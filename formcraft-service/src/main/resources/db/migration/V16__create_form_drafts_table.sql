-- Create Form Drafts table for architectural auto-save feature
CREATE TABLE IF NOT EXISTS form_drafts (
    id UUID PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schema JSONB NOT NULL,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    banner_url TEXT,
    theme_color VARCHAR(50),
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by creator and form reference
CREATE INDEX idx_form_drafts_creator ON form_drafts(created_by);
CREATE INDEX idx_form_drafts_form_id ON form_drafts(form_id);
