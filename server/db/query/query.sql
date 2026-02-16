-- name: InsertJob :one
INSERT INTO jobs (position, company)
VALUES ($1, $2)
RETURNING *;

-- name: GetJobs :many
SELECT * FROM jobs;

-- name: UpdateJob :exec
UPDATE jobs
SET position = $2, company = $3
WHERE id = $1;

-- name: DeleteJob :exec
DELETE FROM jobs
WHERE id = $1;