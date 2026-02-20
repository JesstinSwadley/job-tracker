-- name: InsertJob :one
INSERT INTO jobs (position, company, user_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetJobs :many
SELECT * FROM jobs
WHERE user_id = $1;

-- name: UpdateJob :one
UPDATE jobs
SET position = $2, company = $3
WHERE id = $1 AND user_id = $4
RETURNING *;

-- name: DeleteJob :exec
DELETE FROM jobs
WHERE id = $1 AND user_id= $2;