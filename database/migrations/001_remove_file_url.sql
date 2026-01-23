-- Migration: Remove file_url column from files table
-- This column is no longer needed since we're fetching files from Helium using file_id

-- Drop the file_url column
ALTER TABLE files DROP COLUMN IF EXISTS file_url;

-- Update the comment on file_id column
COMMENT ON COLUMN files.file_id IS 'Helium file ID (for both uploaded and generated files)';
