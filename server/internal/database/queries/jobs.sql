-- name: CreateJob :one
INSERT INTO jobs (
    company,
    title,
    location,
    work_arrangement,
    source,
    application_platform,
    url,
    stage,
    interview_round,
    status,
    date_posted,
    date_found,
    date_assessed,
    date_applied,
    resume_url,
    cover_letter_url,
    notes
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetJob :one
SELECT
	j.*,
	ja.total_score AS assessment_total_score,
	ja.recommendation AS assessment_recommendation,
	(SELECT COUNT(*) FROM job_notes jn WHERE jn.job_id = j.id) AS notes_count
FROM jobs j
LEFT JOIN job_assessments ja ON j.id = ja.job_id
WHERE j.id = ? LIMIT 1;

-- name: ListJobs :many
SELECT
	j.*,
	ja.total_score AS assessment_total_score,
	ja.recommendation AS assessment_recommendation,
	(SELECT COUNT(*) FROM job_notes jn WHERE jn.job_id = j.id) AS notes_count
FROM jobs j
LEFT JOIN job_assessments ja ON j.id = ja.job_id
ORDER BY j.created_at DESC;

-- name: UpdateJob :one
UPDATE jobs
SET
    company = ?,
    title = ?,
    location = ?,
    work_arrangement = ?,
    source = ?,
    application_platform = ?,
    url = ?,
    stage = ?,
    interview_round = ?,
    status = ?,
    date_posted = ?,
    date_found = ?,
    date_assessed = ?,
    date_applied = ?,
    resume_url = ?,
    cover_letter_url = ?,
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

-- name: MarkJobAssessed :exec
UPDATE jobs
SET
	date_assessed = COALESCE(date_assessed, CURRENT_TIMESTAMP),
	stage = CASE WHEN stage = 'Search' THEN 'Assessment' ELSE stage END,
	updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetAssessmentByJobID :one
SELECT * FROM job_assessments
WHERE job_id = ? LIMIT 1;

-- name: CreateJobNote :one
INSERT INTO job_notes (
	job_id,
	section,
	interview_round,
	content
) VALUES (
	?, ?, ?, ?
)
RETURNING *;

-- name: ListJobNotesByJobID :many
SELECT * FROM job_notes
WHERE job_id = ?
ORDER BY created_at DESC, id DESC;

-- name: UpdateJobNote :one
UPDATE job_notes
SET
	section = ?,
	interview_round = ?,
	content = ?,
	updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND job_id = ?
RETURNING *;

-- name: DeleteJobNote :exec
DELETE FROM job_notes
WHERE id = ? AND job_id = ?;