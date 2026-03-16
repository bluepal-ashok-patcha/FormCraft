-- Drop the existing foreign key constraint
-- PostgreSQL default naming for foreign keys is: [table]_[column]_fkey
ALTER TABLE form_responses DROP CONSTRAINT IF EXISTS form_responses_form_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE form_responses 
ADD CONSTRAINT form_responses_form_id_fkey 
FOREIGN KEY (form_id) 
REFERENCES forms(id) 
ON DELETE CASCADE;
