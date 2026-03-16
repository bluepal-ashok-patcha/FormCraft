-- Drop active column from forms table as we now use 'status' enum
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='active') THEN
        ALTER TABLE forms DROP COLUMN active;
    END IF;
END $$;
