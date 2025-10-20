-- name: InsertJob :one
INSERT INTO jobs (position, company)
VALUES ($1, $2)
RETURNING *;

-- name: ListJobs :many
SELECT * FROM jobs;