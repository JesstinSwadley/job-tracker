-- name: InsertUser :one
INSERT INTO users (username, hash_password)
VALUES ($1, $2)
RETURNING *;