-- name: GetJob :one
SELECT * FROM jobs
WHERE id = $1;