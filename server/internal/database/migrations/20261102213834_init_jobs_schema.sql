-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS jobs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	company TEXT NOT NULL,
	title TEXT NOT NULL,
	location TEXT,
	work_arrangement TEXT,
	url TEXT,
	stage TEXT NOT NULL DEFAULT 'Search',
	status TEXT NOT NULL DEFAULT 'Active',
	date_posted DATETIME,
	date_found DATETIME DEFAULT CURRENT_TIMESTAMP,
	date_assessed DATETIME,
	date_applied DATETIME,
	notes TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_assessments (
	job_id INTEGER PRIMARY KEY,
    career_alignment INTEGER DEFAULT 0,
    experience_match INTEGER DEFAULT 0,
    technical_alignment INTEGER DEFAULT 0,
    compensation_score INTEGER DEFAULT 0,
    work_arrangement_score INTEGER DEFAULT 0,
    geographic_alignment INTEGER DEFAULT 0,
    growth_value INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    recommendation TEXT,
    FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS job_assessments;
DROP TABLE IF EXISTS jobs;
-- +goose StatementEnd
