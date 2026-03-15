DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='active') THEN
        ALTER TABLE forms ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='expires_at') THEN
        ALTER TABLE forms ADD COLUMN expires_at TIMESTAMP;
    END IF;
END $$;
