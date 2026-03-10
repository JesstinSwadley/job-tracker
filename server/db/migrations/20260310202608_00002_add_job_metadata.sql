-- +goose Up
-- +goose StatementBegin
ALTER TABLE jobs 
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Applied',
ADD COLUMN salary VARCHAR(100),
ADD COLUMN job_url TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN source VARCHAR(100),
ADD COLUMN location_type VARCHAR(50) DEFAULT 'Remote',
ADD COLUMN applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN interviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_modtime
BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_job_modtime ON jobs;

DROP FUNCTION IF EXISTS update_modified_column();

ALTER TABLE jobs 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS salary,
DROP COLUMN IF EXISTS job_url,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS source,
DROP COLUMN IF EXISTS location_type,
DROP COLUMN IF EXISTS applied_at,
DROP COLUMN IF EXISTS interviewed_at,
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;
-- +goose StatementEnd