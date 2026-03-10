-- name: InsertJob :one
INSERT INTO jobs (
	position, 
	company, 
	user_id,
	status,
	salary,
	job_url,
	notes,
	source,
	location_type,
	applied_at,
	interviewed_at
) VALUES (
	$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING *;

-- name: GetJobs :many
SELECT * FROM jobs
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: UpdateJob :one
UPDATE jobs
SET 
	position = $2, 
	company = $3,
	status = $4,
	salary = $5,
	job_url = $6,
	notes = $7,
	source = $8,
	location_type = $9,
	applied_at = $10,
	interviewed_at = $11
WHERE id = $1 AND user_id = $12
RETURNING *;

-- name: DeleteJob :exec
DELETE FROM jobs
WHERE id = $1 AND user_id = $2;