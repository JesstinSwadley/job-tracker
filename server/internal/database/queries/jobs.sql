-- name: CreateJob :one
INSERT INTO jobs (
	company,
	title,
	location,
	work_arrangement,
	url,
	stage,
	status,
	date_posted,
	notes
) VALUES (
	?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetJob :one
SELECT * FROM jobs
WHERE id = ? LIMIT 1;

-- name: ListJobs :many
SELECT * FROM jobs
ORDER BY created_at DESC;

-- name: UpdateJob :one
UPDATE jobs
SET
company = ?,
	title = ?,
	location = ?,
	work_arrangement = ?,
	url = ?,
	stage = ?,
	status = ?,
	date_posted = ?,
	date_assessed = ?,
	date_applied = ?,
	notes = ?,
	updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteJob :exec
DELETE FROM jobs
WHERE id = ?;

-- name: CreateOrUpdateAssessment :exec
INSERT INTO job_assessments (
    job_id, 
	career_alignment, 
	experience_match, 
	technical_alignment, 
    compensation_score, 
	work_arrangement_score, 
	geographic_alignment, 
    growth_value, 
	total_score, 
	recommendation
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
ON CONFLICT(job_id) DO UPDATE SET
    career_alignment = excluded.career_alignment,
    experience_match = excluded.experience_match,
    technical_alignment = excluded.technical_alignment,
    compensation_score = excluded.compensation_score,
    work_arrangement_score = excluded.work_arrangement_score,
    geographic_alignment = excluded.geographic_alignment,
    growth_value = excluded.growth_value,
    total_score = excluded.total_score,
    recommendation = excluded.recommendation;

-- name: GetAssessmentByJobID :one
SELECT * FROM job_assessments
WHERE job_id = ? LIMIT 1;
