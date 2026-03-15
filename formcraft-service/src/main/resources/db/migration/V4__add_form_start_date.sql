-- Add starts_at column to forms table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='starts_at') THEN
        ALTER TABLE forms ADD COLUMN starts_at TIMESTAMP;
    END IF;
END $$;
