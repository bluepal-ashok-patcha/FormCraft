DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT '';
        UPDATE users SET full_name = username WHERE full_name = '';
        ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
    END IF;
END $$;
