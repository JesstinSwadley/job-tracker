-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS jobs (
	id SERIAL PRIMARY KEY,
	position VARCHAR(255) NOT NULL,
	company VARCHAR(255) NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE jobs;
-- +goose StatementEnd