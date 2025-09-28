-- name: InsertJob :one
INSERT INTO jobs (position, company)
VALUES ($1, $2)
RETURNING *;