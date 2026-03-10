-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(255) UNIQUE NOT NULL,
	hash_password TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
	id SERIAL PRIMARY KEY,
	position VARCHAR(255) NOT NULL,
	company VARCHAR(255) NOT NULL,
	user_id INT NOT NULL,
	CONSTRAINT fk_user
		FOREIGN KEY(user_id) 
		REFERENCES users(id) 
		ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
