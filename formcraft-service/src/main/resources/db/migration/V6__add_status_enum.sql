-- Add status column to forms table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='status') THEN
        ALTER TABLE forms ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
        
        -- Update existing data: if starts_at is future, it's PLANNED
        UPDATE forms SET status = 'PLANNED' WHERE starts_at > NOW();
        
        -- If active is false OR expiresAt is past, it's INACTIVE
        UPDATE forms SET status = 'INACTIVE' WHERE active = FALSE OR (expires_at IS NOT NULL AND expires_at < NOW());
    END IF;
END $$;
