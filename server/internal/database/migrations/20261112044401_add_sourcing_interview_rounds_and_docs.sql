-- +goose Up
-- +goose StatementBegin
ALTER TABLE jobs ADD COLUMN source TEXT;
ALTER TABLE jobs ADD COLUMN application_platform TEXT;
ALTER TABLE jobs ADD COLUMN interview_round INTEGER DEFAULT 0;
ALTER TABLE jobs ADD COLUMN resume_url TEXT;
ALTER TABLE jobs ADD COLUMN cover_letter_url TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE jobs DROP COLUMN cover_letter_url;
ALTER TABLE jobs DROP COLUMN resume_url;
ALTER TABLE jobs DROP COLUMN interview_round;
ALTER TABLE jobs DROP COLUMN application_platform;
ALTER TABLE jobs DROP COLUMN source;
-- +goose StatementEnd