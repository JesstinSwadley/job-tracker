-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS job_notes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	job_id INTEGER NOT NULL,
	section TEXT NOT NULL DEFAULT 'General',
	interview_round INTEGER DEFAULT 0,
	content TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON job_notes(job_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_job_notes_job_id;
DROP TABLE IF EXISTS job_notes;
-- +goose StatementEnd