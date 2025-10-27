-- name: InsertJob :one
INSERT INTO jobs (position, company)
VALUES ($1, $2)
RETURNING *;

-- name: ListJobs :many
SELECT * FROM jobs;

-- name: UpdateJob :exec
UPDATE jobs
SET position = $2, company = $3
WHERE id = $1;