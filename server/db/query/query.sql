-- name: InsertJob :exec
INSERT INTO jobs (position, company)
VALUES ($1, $2);