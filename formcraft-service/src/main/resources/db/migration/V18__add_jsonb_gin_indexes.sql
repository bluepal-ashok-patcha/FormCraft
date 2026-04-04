-- 🛡️ FormCraft Performance Hardening Pulse [V18]
-- Target: High-throughput JSONB indexing for mass data harvesting

-- Create a Generalized Inverted Index (GIN) on the response_data column.
-- This allows PostgreSQL to instantly query deep keys inside the JSONB blob
-- without performing a full sequential table scan.
CREATE INDEX IF NOT EXISTS idx_response_data_gin ON form_responses USING GIN (response_data);

-- Additionally, index the 'schema' column in the forms table for faster builder loads
CREATE INDEX IF NOT EXISTS idx_forms_schema_gin ON forms USING GIN (schema);
